#ifndef FILTER_H_INCLUDED
#define FILTER_H_INCLUDED

#include "common.h"
#include "fft.h"

void filter(
  kiss_fft_cpx *input,
  tdval_t *output,
  int inputSize,
  int outputSize,
  int sampleRate
);

#endif
