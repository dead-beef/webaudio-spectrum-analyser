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

void smooth_fft_val(fftval_t *in, fftval_t *out, int length, float factor);

void smooth_fft_mag(fftmag_t *in, fftmag_t *out, int length, float factor);

void magnitude(fftval_t *in, fftmag_t *out, int length);

void magnitude_to_decibels(
  fftmag_t *in,
  fftmag_t *out,
  int length,
  fftmag_t reference,
  fftmag_t min_decibels,
  fftmag_t max_decibels
);

void magnitude_from_decibels(
  fftmag_t *in,
  fftmag_t *out,
  int length,
  fftmag_t reference
);

fftmag_t max_magnitude(fftmag_t *fft, int start, int end);

double interpolate_peak(fftmag_t *mag, int bin_count, int i, fftmag_t *value);

void fft_scale(
  fftval_t *fft_buf,
  int length,
  int i,
  int radius,
  float factor,
  int smooth
);

void fft_copy(
  fftval_t *fft_buf,
  int length,
  int src,
  int dst,
  int radius,
  float scale,
  int smooth
);

#endif
