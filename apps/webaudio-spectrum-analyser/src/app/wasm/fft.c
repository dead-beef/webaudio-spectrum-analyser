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

void normalize(tdval_t *in, tdval_t *out, int length) {
  //double mean_ = mean(in, length);
  for (int i = 0; i < length; ++i) {
    out[i] = (in[i] /*- mean_*/) / length;
  }
}

void window(tdval_t *in, tdval_t *out, int length) {
  tdval_t n = length - 1;
  for (int i = 0; i < length; ++i) {
    tdval_t w = 0.5 * (1.0 - cos(2.0 * M_PI * i / n));
    out[i] = in[i] * w;
  }
}

void fft(tdval_t *in, fftval_t *out, int length) {
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

void ifft(fftval_t *in, tdval_t *out, int length) {
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

void smooth_fft_val(fftval_t *in, fftval_t *out, int length, float factor) {
  double factor_in = 1.0 - factor;
  for (int i = 0; i < length; ++i) {
    out[i].r = factor * out[i].r + factor_in * in[i].r;
    out[i].i = factor * out[i].i + factor_in * in[i].i;
  }
}

void smooth_fft_mag(fftmag_t *in, fftmag_t *out, int length, float factor) {
  double factor_in = 1.0 - factor;
  for (int i = 0; i < length; ++i) {
    out[i] = factor * out[i] + factor_in * in[i];
  }
}

void magnitude(fftval_t *in, fftmag_t *out, int length, int decibels) {
  for (int i = 0; i < length; ++i) {
    double val = in[i].r * in[i].r + in[i].i * in[i].i;
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

fftmag_t max_magnitude(fftmag_t *fft, int start, int end) {
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

int index_of_max_peak(fftmag_t *mag, int bin_count, int start, int end) {
  int ret = -1;
  fftmag_t val;
  start = clamp(start, 1, bin_count - 2);
  end = clamp(end, 1, bin_count - 2);
  for (int i = start; i <= end; ++i) {
    if (mag[i] > mag[i - 1] && mag[i] > mag[i + 1]) {
      if (ret < 0 || val < mag[i]) {
        ret = i;
        val = mag[i];
      }
    }
  }
  return ret;
}

double interpolate_peak(fftmag_t *mag, int bin_count, int i, fftmag_t *value) {
  if (i <= 0 || i >= bin_count - 1) {
    if (value) {
      *value = mag[i];
    }
    return 0.0;
  }
  fftmag_t left = mag[i - 1];
  fftmag_t peak = mag[i];
  fftmag_t right = mag[i + 1];

  double c = peak;
  double b = (right - left) / 2.0;
  double a = left + b - c;

  double x = -b / (2.0 * a);
  if (value) {
    *value = x * (a * x + b) + c;
  }

  return x;
}

void fft_scale(
  fftval_t *fft_buf,
  int length,
  int i,
  int radius,
  float factor,
  int smooth
) {
  double wnd_k = /* 2.0 * */ M_PI / (/* 2.0 * */ radius);
  for (int j = -radius; j <= radius; ++j) {
    int k = i + j;
    if (k >= 0 && k < length) {
      double scale;
      if (smooth) {
        double wnd = 0.5 * (1.0 - cos(wnd_k * (j + radius)));
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
  float scale,
  int smooth
) {
  double wnd_k = /* 2.0 * */ M_PI / (/* 2.0 * */ radius);
  for (int j = -radius; j <= radius; ++j) {
    int src_ = src + j;
    int dst_ = dst + j;
    if (src_ >= 0 && src_ < length && dst_ >= 0 && dst_ < length) {
      if (smooth) {
        double wnd = 0.5 * (1.0 - cos(wnd_k * (j + radius)));
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
