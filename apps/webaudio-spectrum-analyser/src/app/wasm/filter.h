#ifndef FILTER_H_INCLUDED
#define FILTER_H_INCLUDED

#include "common.h"
#include "fft.h"

void filter_start(tdval_t *input, fftval_t *fft_buf, int length);

void filter_end(tdval_t *output, fftval_t *fft_buf, int length);

void gain(fftval_t *fft_buf, int fft_size, float db);

void remove_harmonics(
  fftval_t *fft_buf,
  int fft_size,
  int sample_rate,
  float min_pitch,
  float max_pitch,
  int min_harmonic,
  int max_harmonic,
  int step,
  float f_scale_radius,
  float harmonic_search_radius,
  int smooth_scale
);

void add_harmonics(
  fftval_t *fft_buf,
  int fft_size,
  int sample_rate,
  float min_pitch,
  float max_pitch,
  int min_harmonic,
  int max_harmonic,
  int step,
  float f_copy_radius,
  float harmonic_search_radius,
  int smooth_copy
);

#endif
