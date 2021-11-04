#ifndef MPD_H_INCLUDED
#define MPD_H_INCLUDED

#include "common.h"

number mpd(
  number *fft_peak_buf,
  number *pd_hist_buf,
  int bin_count,
  int peak_count
);

#endif
