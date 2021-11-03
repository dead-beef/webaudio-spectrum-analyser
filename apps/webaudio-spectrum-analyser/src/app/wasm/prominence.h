#ifndef PROMINENCE_H_INCLUDED
#define PROMINENCE_H_INCLUDED

#include "common.h"

void prominence(
  fftmag_t *fft,
  fftmag_t *peaks,
  fftmag_t *res,
  int bin_count,
  int peak_count,
  int start,
  int end,
  int radius,
  int normalize
);

int prominencepeak(
  fftmag_t *prdata,
  int length,
  int start,
  int end,
  fftmag_t threshold,
  fftpeak_t type
);

#endif
