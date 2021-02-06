#ifndef FILTER_H_INCLUDED
#define FILTER_H_INCLUDED

#include "common.h"
#include "fft.h"

void filter_start(tdval_t *input, fftval_t *fft_buf, int length);

void filter_end(tdval_t *output, fftval_t *fft_buf, int length);

void filter(
  tdval_t *input,
  tdval_t *output,
  int length,
  int sample_rate
);

#endif
