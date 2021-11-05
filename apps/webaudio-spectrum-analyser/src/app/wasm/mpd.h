#ifndef MPD_H_INCLUDED
#define MPD_H_INCLUDED

#include "common.h"
#include "fft.h"

number mpd(
  const fftpeak_t *fft_peak_buf,
  number *pd_hist_buf,
  int bin_count,
  int peak_count
);

#endif
