#ifndef AUTOCORR_H_INCLUDED
#define AUTOCORR_H_INCLUDED

#include "common.h"

number autocorr1(
  number *tdata,
  int length,
  number mean,
  number variance,
  int offset
);

void autocorr(
  number *tdata,
  number *res,
  int length,
  int min_offset,
  int max_offset
);

int autocorrpeak(
  number *acdata,
  int length,
  int min_offset,
  int max_offset
);

#endif
