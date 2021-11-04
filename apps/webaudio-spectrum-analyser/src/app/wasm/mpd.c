#include "mpd.h"

#include <math.h>

static void get_peak_distances(
  number *peak_buf,
  int peaks,
  number *peak_dist_buf,
  number *pd_hist_buf
) {
  int peak_dists = peaks - 1;
  for (int i = 0; i < peak_dists; ++i) {
    number dist = peak_buf[(i + 1) * 2] - peak_buf[i * 2];
    peak_dist_buf[i] = dist;
    if (pd_hist_buf) {
      int j = floor(dist);
      number frac = dist - j;
      pd_hist_buf[j] += 1.0 - frac;
      pd_hist_buf[j + 1] += frac;
    }
  }
}

static int get_harmonic_numbers(
  number *peak_buf,
  int peak_count,
  number f0,
  number *fs,
  number *harmonic_numbers
) {
  int i = 0;
  for (; i < peak_count && peak_buf[i * 2] / f0 < 0.8; ++i);
  int skip = i;
  for (; i < peak_count; ++i) {
    number f = peak_buf[i * 2];
    fs[i - skip] = f;
    harmonic_numbers[i - skip] = round(f / f0);
  }
  return peak_count - skip;
}

EMSCRIPTEN_KEEPALIVE
number mpd(
  number *fft_peak_buf,
  number *pd_hist_buf,
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

  number peak_dist_buf[peak_dist_count];
  get_peak_distances(fft_peak_buf, peak_count, peak_dist_buf, pd_hist_buf);

  number f0 = median(peak_dist_buf, peak_dist_count);

  number fs[peak_count];
  number harmonic_numbers[peak_count];
  peak_count = get_harmonic_numbers(fft_peak_buf, peak_count, f0, fs, harmonic_numbers);

  number res =
    dot(fs, harmonic_numbers, peak_count)
    / dot(harmonic_numbers, harmonic_numbers, peak_count);

  return res;
}
