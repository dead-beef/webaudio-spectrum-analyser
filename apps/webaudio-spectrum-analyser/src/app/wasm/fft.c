#include "fft.h"

#include <math.h>
#include <float.h>

#ifdef CLI
#include <stdio.h>
#endif

void* no_fft_malloc(size_t size __attribute__((unused))) {
#ifdef CLI
  fprintf(stderr, "no_fft_malloc\n");
#endif
  abort();
}

void no_fft_free(void *ptr __attribute__((unused))) {
#ifdef CLI
  fprintf(stderr, "no_fft_free\n");
#endif
}

#include <kissfft/kiss_fft.c>
#include <kissfft/tools/kiss_fftr.c>

void normalize(const tdval_t *in, tdval_t *out, int length) {
  //number mean_ = mean(in, length);
  for (int i = 0; i < length; ++i) {
    out[i] = (in[i] /*- mean_*/) / length;
  }
}

void normalize_fftmag(const fftmag_t *in, fftmag_t *out, int length) {
  number min_, max_;
  number mean_ = mean(in, length);
  range(in, length, &min_, &max_);
  number k = 1.0 / ((max_ - mean_) * length);
  for (int i = 0; i < length; ++i) {
    out[i] = (in[i] - mean_) * k;
  }
}

void window(const tdval_t *in, tdval_t *out, int length) {
  tdval_t n = length - 1;
  for (int i = 0; i < length; ++i) {
    tdval_t w = 0.5 * (1.0 - cos(2.0 * M_PI * i / n));
    out[i] = in[i] * w;
  }
}

void fft(const tdval_t *in, fftval_t *out, int length) {
  kiss_fft_cpx _cfg_alloc[2 * length];
  size_t cfg_size = sizeof(_cfg_alloc);
  kiss_fftr_cfg cfg = (kiss_fftr_cfg)(_cfg_alloc);
  cfg = kiss_fftr_alloc(length, FALSE, cfg, &cfg_size);
#ifdef CLI
  if (!cfg) {
    fprintf(stderr, "Could not allocate fft config\n");
  }
#endif
  kiss_fftr(cfg, in, out);
}

void ifft(const fftval_t *in, tdval_t *out, int length) {
  kiss_fft_cpx _cfg_alloc[2 * length];
  size_t cfg_size = sizeof(_cfg_alloc);
  kiss_fftr_cfg cfg = (kiss_fftr_cfg)(_cfg_alloc);
  cfg = kiss_fftr_alloc(length, TRUE, cfg, &cfg_size);
#ifdef CLI
  if (!cfg) {
    fprintf(stderr, "Could not allocate inverse fft config\n");
  }
#endif
  kiss_fftri(cfg, in, out);
}

EMSCRIPTEN_KEEPALIVE
void cepstrum(const fftmag_t *fftmag_buf, fftmag_t *out, int fft_size) {
  int fft_bins = fft_size / 2;
  int cepstrum_bins = 1 + fft_bins / 2;
  fftmag_t normalized_fftmag_buf[fft_bins];
  normalize_fftmag(fftmag_buf, normalized_fftmag_buf, fft_bins);
  fftval_t tmp[cepstrum_bins];
  fft(normalized_fftmag_buf, tmp, fft_bins);
  magnitude(tmp, out, cepstrum_bins, FALSE);
}

void smooth_fft_val(
  const fftval_t *next,
  fftval_t *cur,
  int length,
  number factor
) {
  number factor_next = 1.0 - factor;
  for (int i = 0; i < length; ++i) {
    cur[i].r = factor * cur[i].r + factor_next * next[i].r;
    cur[i].i = factor * cur[i].i + factor_next * next[i].i;
  }
}

void smooth_fft_mag(
  const fftmag_t *next,
  fftmag_t *cur,
  int length,
  number factor
) {
  number factor_next = 1.0 - factor;
  for (int i = 0; i < length; ++i) {
    cur[i] = factor * cur[i] + factor_next * next[i];
  }
}

void magnitude(const fftval_t *in, fftmag_t *out, int length, int decibels) {
  for (int i = 0; i < length; ++i) {
    number val = in[i].r * in[i].r + in[i].i * in[i].i;
    if (decibels) {
      val /= DB_REF;
      if (val < DBL_EPSILON) {
        val = DB_MIN;
      } else {
        val = 10 * log10(val);
        val = clamp(val, DB_MIN, DB_MAX);
      }
    } else {
      val = sqrt(val);
    }
    out[i] = val;
  }
}

fftmag_t max_magnitude(const fftmag_t *fft, int start, int end) {
  if (start >= end) {
    return 0;
  }
  fftmag_t ret = fft[start];
  for (int i = start + 1; i < end; ++i) {
    if (fft[i] > ret) {
      ret = fft[i];
    }
  }
  return ret;
}

static number mask_const(
  number distance __attribute__((unused)),
  number radius __attribute__((unused))
) {
  return 1.0;
}

static number mask_linear(number distance, number radius) {
  return 1.0 - distance / radius;
}

static number mask_hann(number distance, number radius) {
  number k = /* 2.0 * */ M_PI / (/* 2.0 * */ radius);
  return 0.5 * (1.0 - cos(k * (distance + radius)));
}

EMSCRIPTEN_KEEPALIVE
int fftpeaks(
  const fftmag_t *mag,
  fftpeak_t *res,
  int bin_count,
  peakmask_t mask,
  number mask_radius
) {
  unsigned char discard[1 + bin_count / 2];
  int peaks = 0;
  peakmask_func_t mask_func;

  switch (mask) {
    case PM_CONST:
      mask_func = mask_const;
      break;
    case PM_LINEAR:
      mask_func = mask_linear;
      break;
    case PM_HANN:
      mask_func = mask_hann;
      break;
    default:
      mask_func = NULL;
      break;
  }

  for (int i = 1; i < bin_count - 1; ++i) {
    if (mag[i] >= mag[i - 1] && mag[i] > mag[i + 1]) {
      number peak_mag;
      number peak_idx = i
        + interpolate_peak(mag, bin_count, i, &peak_mag);

      res[peaks].index = peak_idx;
      res[peaks].magnitude = peak_mag;
      discard[peaks] = FALSE;

      if (mask_func) {
        for (int prev = peaks - 1; prev >= 0; --prev) {
          number distance = peak_idx - res[prev].index;
          if (distance > mask_radius) {
            break;
          }
          number factor = mask_func(distance, mask_radius);
          number prev_peak_mag = res[prev].magnitude;

          if (peak_mag < prev_peak_mag) {
            discard[peaks] = discard[peaks]
              || peak_mag < DB_MIN + factor * (prev_peak_mag - DB_MIN);
          } else {
            discard[prev] = discard[prev]
              || prev_peak_mag < DB_MIN + factor * (peak_mag - DB_MIN);
          }
        }
      }

      ++peaks;
    }
  }

  if (mask_func) {
    int filtered_peaks = 0;
    for (int i = 0; i < peaks; ++i) {
      if (!discard[i]) {
        res[filtered_peaks++] = res[i];
      }
    }
    peaks = filtered_peaks;
  }

  if (peaks + 1 < bin_count / 2) {
    ++peaks;
    res[peaks].index = -1.0;
    res[peaks].magnitude = -1.0;
  }

  return peaks;
}

void fft_scale(
  fftval_t *fft_buf,
  int bin_count,
  int i,
  int radius,
  number factor,
  int smooth
) {
  number wnd_k = /* 2.0 * */ M_PI / (/* 2.0 * */ radius);
  for (int j = -radius; j <= radius; ++j) {
    int k = i + j;
    if (k >= 0 && k < bin_count) {
      number scale;
      if (smooth) {
        number wnd = 0.5 * (1.0 - cos(wnd_k * (j + radius)));
        scale = wnd * factor + (1.0 - wnd) /* * 1.0 */;
      } else {
        scale = factor;
      }
      fft_buf[k].r *= scale;
      fft_buf[k].i *= scale;
    }
  }
}

void fft_copy(
  fftval_t *fft_buf,
  int bin_count,
  int src,
  int dst,
  int radius,
  number scale,
  int smooth
) {
  number wnd_k = /* 2.0 * */ M_PI / (/* 2.0 * */ radius);
  for (int j = -radius; j <= radius; ++j) {
    int src_ = src + j;
    int dst_ = dst + j;
    if (src_ >= 0 && src_ < bin_count && dst_ >= 0 && dst_ < bin_count) {
      if (smooth) {
        number wnd = 0.5 * (1.0 - cos(wnd_k * (j + radius)));
        fft_buf[dst_].r =
          wnd * scale * fft_buf[src_].r + (1.0 - wnd) * fft_buf[dst_].r;
        fft_buf[dst_].i =
          wnd * scale * fft_buf[src_].i + (1.0 - wnd) * fft_buf[dst_].i;
      } else {
        fft_buf[dst_].r = scale * fft_buf[src_].r;
        fft_buf[dst_].i = scale * fft_buf[src_].i;
      }
    }
  }
}
