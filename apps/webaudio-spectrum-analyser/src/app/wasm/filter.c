#include "filter.h"
#include "prominence.h"

void filter_start(tdval_t *input, fftval_t *fft_buf, int length) {
  normalize(input, input, length);
  window(input, input, length);
  fft(input, fft_buf, length);
}

void filter_end(tdval_t *output, fftval_t *fft_buf, int length) {
  ifft(fft_buf, output, length);
}


void remove_phase(fftval_t *ft, int bins) {
  fftmag_t mag[bins];
  magnitude(ft, mag, bins);
  for (int i = 0; i < bins; ++i) {
    ft[i].r = mag[i];
    ft[i].i = 0.0;
  }
}

void remove_frequencies(
  fftval_t *ft,
  int fft_size,
  int sample_rate,
  float start,
  float end
) {
  double bin_size = (double)sample_rate / fft_size;
  int bins = 1 + fft_size / 2;
  int start_ = start > 0.0 ? round(start / bin_size) : 0;
  int end_ = end > 0.0 ? round(end / bin_size) : bins - 1;
  start_ = clamp(start_, 0, bins - 1);
  end_ = clamp(end_, 0, bins - 1);
  for (int i = start_; i < end_; ++i) {
    ft[i].r = 0.0;
    ft[i].i = 0.0;
  }
}

void resonance_(fftval_t *ft, int bins, double bin_size) {
  double fr = 210.0;
  double fr_prev = 110.0;
  double amount = 1.0;

  fftmag_t mag[bins];
  magnitude(ft, mag, bins);

  /*int start = floor(90.0 / bin_size);
  int end = ceil(250.0 / bin_size);
  fftmag_t max_mag = 0;
  for (int i = 1; i < end; ++i) {
    if (max_mag < mag[i]) {
      max_mag = mag[i];
      fr_prev = i * bin_size;
    }
  }*/

  for (int i = 1; i < bins; ++i) {
    double f = i * bin_size;

    double s = 2.0 * (1.0 - fabs(cos(M_PI * f / fr_prev)));

    s *= 2 * fabs(cos(M_PI * f / fr));

    amount = exp(20 * -(i - 1) / bins);

    ft[i].r *= amount * s + (1.0 - amount);
    ft[i].i *= amount * s + (1.0 - amount);
  }
}


void remove_harmonics(fftval_t *fft_buf, int bins, double bin_size) {
  const fftmag_t fft_mag_min = -100.0;
  const fftmag_t fft_mag_max = 0.0;

  double min_pitch = 90.0;
  double max_pitch = 250.0;
  int max_harmonic = 100;
  fftmag_t prominence_threshold = 5.0;
  double f_scale_radius = 60.0;
  double harmonic_search_radius = 0.3;
  int smooth_scale = FALSE;

  fftmag_t magnitude_buf[bins];
  fftmag_t prominence_buf[bins];

  magnitude(fft_buf, magnitude_buf, bins);
  magnitude_to_decibels(
    magnitude_buf,
    magnitude_buf,
    bins,
    1.0,
    fft_mag_min,
    fft_mag_max
  );

  int start = round(min_pitch / bin_size);
  int end = round(max_pitch / bin_size);
  int scale_radius = ceil(f_scale_radius / bin_size);

  int peak = prominencepeak(
    magnitude_buf, prominence_buf, bins,
    start, end, -1,
    fft_mag_min, fft_mag_max,
    prominence_threshold,
    MIN_FREQUENCY,
    FALSE
  );

  if (peak > 0) {
    double pitch = peak * bin_size;
    fft_scale(
      fft_buf, magnitude_buf, NULL, bins,
      peak, scale_radius,
      0.0, smooth_scale
    );
    for (int h = 3; h <= max_harmonic; h += 2) {
      double f_min = (h - harmonic_search_radius) * pitch;
      double f_max = (h + harmonic_search_radius) * pitch;
      start = round(f_min / bin_size);
      end = round(f_max / bin_size);
      peak = prominencepeak(
        magnitude_buf, prominence_buf, bins,
        start, end, -1,
        fft_mag_min, fft_mag_max,
        0.0,
        MAX_PROMINENCE,
        FALSE
      );
      if (peak > 0) {
        fft_scale(
          fft_buf, magnitude_buf, NULL, bins,
          peak, scale_radius,
          0.0, smooth_scale
        );
      }
    }
  }
}


EMSCRIPTEN_KEEPALIVE
void filter(
  tdval_t *input,
  tdval_t *output,
  int length,
  int sample_rate
) {
  int bins = 1 + length / 2;
  double bin_size = (double)sample_rate / length;
  fftval_t ft[bins];

  filter_start(input, ft, length);

  remove_harmonics(ft, bins, bin_size);
  //remove_frequencies(ft, length, sample_rate, 2000, -1);

  filter_end(output, ft, length);
}
