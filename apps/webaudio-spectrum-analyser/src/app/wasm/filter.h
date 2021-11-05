#ifndef FILTER_H_INCLUDED
#define FILTER_H_INCLUDED

#include "common.h"
#include "fft.h"

void filter_start(tdval_t *input, fftval_t *fft_buf, int length);

void filter_end(tdval_t *output, fftval_t *fft_buf, int length);

void gain(fftval_t *fft_buf, int fft_size, number db);

void scale_harmonics(
  fftval_t *fft_buf,
  int fft_size,
  int sample_rate,
  number min_pitch,
  number max_pitch,
  int min_harmonic,
  int max_harmonic,
  int step,
  number factor,
  number f_scale_radius,
  number harmonic_search_radius,
  int smooth_scale
);

void add_harmonics(
  fftval_t *fft_buf,
  int fft_size,
  int sample_rate,
  number min_pitch,
  number max_pitch,
  int min_harmonic,
  int max_harmonic,
  int step,
  number f_copy_radius,
  number harmonic_search_radius,
  int smooth_copy
);

#endif
