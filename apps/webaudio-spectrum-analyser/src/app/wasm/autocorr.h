#ifndef AUTOCORR_H_INCLUDED
#define AUTOCORR_H_INCLUDED

#include "common.h"

void autocorr(
  const number *tdata,
  number *res,
  int length,
  int min_offset,
  int max_offset
);

int autocorrpeak(
  const number *acdata,
  int length,
  int min_offset,
  int max_offset
);

#endif
