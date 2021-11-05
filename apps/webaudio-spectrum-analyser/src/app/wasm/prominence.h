#ifndef PROMINENCE_H_INCLUDED
#define PROMINENCE_H_INCLUDED

#include "common.h"
#include "fft.h"

void prominence(
  const fftmag_t *fft,
  const number *peaks,
  number *res,
  int bin_count,
  int peak_count,
  int start,
  int end,
  int radius,
  int normalize
);

int prominencepeak(
  const fftmag_t *prdata,
  int length,
  int start,
  int end,
  number threshold,
  fftpeak_t type
);

#endif
