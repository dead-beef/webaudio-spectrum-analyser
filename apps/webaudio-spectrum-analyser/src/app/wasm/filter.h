#ifndef FILTER_H_INCLUDED
#define FILTER_H_INCLUDED

#include "common.h"
#include "fft.h"

void filter(
  tdval_t *input,
  tdval_t *output,
  int length,
  int sample_rate
);

#endif
