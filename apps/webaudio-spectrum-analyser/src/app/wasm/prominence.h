#ifndef PROMINENCE_H_INCLUDED
#define PROMINENCE_H_INCLUDED

#include "common.h"

void prominence(
  fftmag_t *fft,
  fftmag_t *res,
  int length,
  int start,
  int end,
  int radius,
  fftmag_t fftmag_min,
  fftmag_t fftmag_max,
  bool normalize
);

int prominencepeak(
  fftmag_t *fft,
  fftmag_t *prdata,
  int length,
  int start,
  int end,
  int radius,
  fftmag_t fftmag_min,
  fftmag_t fftmag_max,
  fftmag_t threshold,
  fftpeak_t type,
  bool normalize
);

#endif
