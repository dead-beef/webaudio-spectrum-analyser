#include "fft.h"

#include <math.h>
#include <float.h>

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
  kiss_fftr(cfg, in, out);
}

void ifft(fftval_t *in, tdval_t *out, int length) {
  kiss_fft_cpx _cfg_alloc[2 * length];
  size_t cfg_size = sizeof(_cfg_alloc);
  kiss_fftr_cfg cfg = (kiss_fftr_cfg)(_cfg_alloc);
  cfg = kiss_fftr_alloc(length, TRUE, cfg, &cfg_size);
  kiss_fftri(cfg, in, out);
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

void magnitude(fftval_t *in, fftmag_t *out, int length) {
  for (int i = 0; i < length; ++i) {
    out[i] = sqrt(in[i].r * in[i].r + in[i].i * in[i].i);
  }
}

void magnitude_to_decibels(
  fftmag_t *in,
  fftmag_t *out,
  int length,
  fftmag_t reference,
  fftmag_t min_decibels,
  fftmag_t max_decibels
) {
  for (int i = 0; i < length; ++i) {
    double val = in[i];
    val /= reference;
    if (val < DBL_EPSILON) {
      val = min_decibels;
    } else {
      val = 10 * log10(val);
      val = clamp(val, min_decibels, max_decibels);
    }
    out[i] = val;
  }
}

void magnitude_from_decibels(
  fftmag_t *in,
  fftmag_t *out,
  int length,
  fftmag_t reference
) {
  for (int i = 0; i < length; ++i) {
    double val = in[i];
    val = pow(10.0, val / 10.0) * reference;
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

double interpolate_peak(fftmag_t *mag, int bin_count, int i, fftmag_t *value) {
  if (i <= 0 || i >= bin_count) {
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
