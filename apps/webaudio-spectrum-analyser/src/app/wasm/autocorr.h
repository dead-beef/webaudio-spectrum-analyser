#ifndef AUTOCORR_H_INCLUDED
#define AUTOCORR_H_INCLUDED

#include "common.h"

double autocorr1(
  tdval_t *tdata,
  int length,
  double mean,
  double variance,
  int offset
);

void autocorr(
  tdval_t *tdata,
  float *res,
  int length,
  int min_offset,
  int max_offset
);

int autocorrpeak(
  float *acdata,
  int length,
  int min_offset,
  int max_offset
);

#endif
