#ifndef MPD_H_INCLUDED
#define MPD_H_INCLUDED

#include "common.h"

double mpd(
  fftmag_t *fft_peak_buf,
  fftmag_t *pd_hist_buf,
  int bin_count,
  int peak_count
);

#endif
