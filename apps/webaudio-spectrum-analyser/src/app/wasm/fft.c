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
void cepstrum(fftmag_t *fft_buf, fftmag_t *out, int fft_size) {
  int fft_bins = fft_size / 2;
  int cepstrum_bins = 1 + fft_bins / 2;
  for (int i = 0; i < fft_bins; ++i) {
    fft_buf[i] = fft_buf[i] / fft_bins;
  }
  fftval_t tmp[cepstrum_bins];
  fft(fft_buf, tmp, fft_bins);
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
  const fftmag_t *data,
  number *output,
  int length,
  peakmask_t mask,
  number mask_radius
) {
  unsigned char discard[length];
  int peaks_2 = 0;
  peakmask_func_t mask_;

  switch (mask) {
    case PM_CONST:
      mask_ = mask_const;
      break;
    case PM_LINEAR:
      mask_ = mask_linear;
      break;
    default:
      mask_ = NULL;
      break;
  }

  for (int i = 1; i < length - 1; ++i) {
    if (data[i] >= data[i - 1] && data[i] > data[i + 1]) {
      output[peaks_2] = i
        + interpolate_peak(data, length, i, output + peaks_2 + 1);
      discard[peaks_2] = FALSE;

      if (mask_) {
        number peak_idx = output[peaks_2];
        number peak_mag = output[peaks_2 + 1];

        for (int prev = peaks_2 - 2; prev >= 0; prev -= 2) {
          number distance = peak_idx - output[prev];
          if (distance > mask_radius) {
            break;
          }
          number factor = mask_(distance, mask_radius);
          number prev_peak_mag = output[prev + 1];

          if (peak_mag < prev_peak_mag) {
            discard[peaks_2] = discard[peaks_2]
              || peak_mag < DB_MIN + factor * (prev_peak_mag - DB_MIN);
          } else {
            discard[prev] = discard[prev]
              || prev_peak_mag < DB_MIN + factor * (peak_mag - DB_MIN);
          }
        }
      }

      peaks_2 += 2;
    }
  }

  int peaks_ = 0;
  if (mask_) {
    for (int i = 0; i < peaks_2; i += 2) {
      if (!discard[i]) {
        output[peaks_] = output[i];
        output[peaks_ + 1] = output[i + 1];
        peaks_ += 2;
      }
    }
  } else {
    peaks_ = peaks_2;
  }

  if (peaks_ + 1 < length) {
    output[peaks_ + 1] = -1.0;
  }

  return peaks_ / 2;
}

void fft_scale(
  fftval_t *fft_buf,
  int length,
  int i,
  int radius,
  number factor,
  int smooth
) {
  number wnd_k = /* 2.0 * */ M_PI / (/* 2.0 * */ radius);
  for (int j = -radius; j <= radius; ++j) {
    int k = i + j;
    if (k >= 0 && k < length) {
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
  int length,
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
    if (src_ >= 0 && src_ < length && dst_ >= 0 && dst_ < length) {
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
