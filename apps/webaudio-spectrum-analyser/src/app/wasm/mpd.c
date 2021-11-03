#include "mpd.h"

#include <math.h>

static void get_peak_distances(
  fftmag_t *peak_buf,
  int peaks,
  fftmag_t *peak_dist_buf,
  fftmag_t *pd_hist_buf
) {
  int peak_dists = peaks - 1;
  for (int i = 0; i < peak_dists; ++i) {
    fftmag_t dist = peak_buf[(i + 1) * 2] - peak_buf[i * 2];
    peak_dist_buf[i] = dist;
    if (pd_hist_buf) {
      int j = floor(dist);
      fftmag_t frac = dist - j;
      pd_hist_buf[j] += 1.0 - frac;
      pd_hist_buf[j + 1] += frac;
    }
  }
}

static int get_harmonic_numbers(
  fftmag_t *peak_buf,
  int peak_count,
  fftmag_t f0,
  fftmag_t *fs,
  fftmag_t *harmonic_numbers
) {
  int i = 0;
  for (; i < peak_count && peak_buf[i * 2] / f0 < 0.8; ++i);
  int skip = i;
  for (; i < peak_count; ++i) {
    fftmag_t f = peak_buf[i * 2];
    fs[i - skip] = f;
    harmonic_numbers[i - skip] = round(f / f0);
  }
  return peak_count - skip;
}

EMSCRIPTEN_KEEPALIVE
double mpd(
  fftmag_t *fft_peak_buf,
  fftmag_t *pd_hist_buf,
  int bin_count,
  int peak_count
) {
  int peak_dist_count = peak_count - 1;
  if (peak_dist_count < 1) {
    return -1.0;
  }
  if (pd_hist_buf) {
    memset(pd_hist_buf, 0, bin_count * sizeof(*pd_hist_buf));
  }

  fftmag_t peak_dist_buf[peak_dist_count];
  get_peak_distances(fft_peak_buf, peak_count, peak_dist_buf, pd_hist_buf);

  double f0 = median(peak_dist_buf, peak_dist_count);

  fftmag_t fs[peak_count];
  fftmag_t harmonic_numbers[peak_count];
  peak_count = get_harmonic_numbers(fft_peak_buf, peak_count, f0, fs, harmonic_numbers);

  double res =
    dot(fs, harmonic_numbers, peak_count)
    / dot(harmonic_numbers, harmonic_numbers, peak_count);

  return res;
}
