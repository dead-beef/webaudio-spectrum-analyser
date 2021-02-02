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

void smooth_fft(fftval_t *in, fftval_t *out, int length, float factor) {
  double factor_in = 1.0 - factor;
  for (int i = 0; i < length; ++i) {
    out[i].r = factor * out[i].r + factor_in * in[i].r;
    out[i].i = factor * out[i].i + factor_in * in[i].i;
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

float interpolate_x(float left, float peak, float right) {
  float c = peak;
  float b = (right - left) / 2.0;
  float a = left + b - c;
  if (fabs(a) < 1e-3) {
    return 0.0;
  }
  return -b / (2.0 * a);
}

float interpolate_y(float left, float peak, float right, float x) {
  float c = peak;
  float b = (right - left) / 2.0;
  float a = left + b - c;
  return x * (a * x + b) + c;
}

float interpolate_y2(float left, float peak, float right) {
  float x = interpolate_x(left, peak, right);
  return interpolate_y(left, peak, right, x);
}

float interpolate_peak(
  fftval_t *bins,
  fftmag_t *mag,
  int bin_count,
  int i,
  fftval_t *value
) {
  if (i <= 0 || i >= bin_count) {
    *value = bins[i];
    return 0.0;
  }
  float x = interpolate_x(mag[i - 1], mag[i], mag[i + 1]);
  //value->r = interpolate_y(bins[i - 1].r, bins[i].r, bins[i + 1].r, x);
  //value->i = interpolate_y(bins[i - 1].i, bins[i].i, bins[i + 1].i, x);
  *value = bins[i];
  return x;
}
