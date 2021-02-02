#ifndef FFT_H_INCLUDED
#define FFT_H_INCLUDED

#include "common.h"

#define NDEBUG 1
#define kiss_fft_scalar tdval_t
#define fftval_t kiss_fft_cpx
#include <kissfft/kiss_fft.h>
//#include <kissfft/tools/kiss_fftr.h>

void normalize(tdval_t *in, tdval_t *out, int length);

void window(tdval_t *in, tdval_t *out, int length);

void fft(tdval_t *in, fftval_t *out, int length);

void ifft(fftval_t *in, tdval_t *out, int length);

void smooth_fft(fftval_t *in, fftval_t *out, int length, float factor);

void magnitude(fftval_t *in, fftmag_t *out, int length);

void magnitude_to_decibels(
  fftmag_t *in,
  fftmag_t *out,
  int length,
  fftmag_t reference,
  fftmag_t min_decibels,
  fftmag_t max_decibels
);

float interpolate_x(float left, float peak, float right);

float interpolate_y(float left, float peak, float right, float x);

float interpolate_y2(float left, float peak, float right);

float interpolate_peak(
  fftval_t *bins,
  fftmag_t *mag,
  int bin_count,
  int i,
  fftval_t *value
);

#endif
