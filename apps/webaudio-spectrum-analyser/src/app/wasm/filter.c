#include "filter.h"
#include "prominence.h"

EMSCRIPTEN_KEEPALIVE
void filter_start(tdval_t *input, fftval_t *fft_buf, int length) {
  normalize(input, input, length);
  window(input, input, length);
  fft(input, fft_buf, length);
}

EMSCRIPTEN_KEEPALIVE
void filter_end(tdval_t *output, fftval_t *fft_buf, int length) {
  ifft(fft_buf, output, length);
}

EMSCRIPTEN_KEEPALIVE
void gain(fftval_t *fft_buf, int fft_size, float db) {
  int bins = 1 + fft_size / 2;
  double scale = pow(10.0, db / 20.0);
  for (int i = 0; i < bins; ++i) {
    fft_buf[i].r *= scale;
    fft_buf[i].i *= scale;
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

EMSCRIPTEN_KEEPALIVE
void remove_harmonics(
  fftval_t *fft_buf,
  int fft_size,
  int sample_rate,
  float min_pitch,
  float max_pitch,
  int min_harmonic,
  int max_harmonic,
  int step,
  fftmag_t prominence_threshold,
  float f_scale_radius,
  float harmonic_search_radius,
  int smooth_scale
) {
  const fftmag_t fft_mag_min = DB_MIN;
  const fftmag_t fft_mag_max = DB_MAX;

  int bins = 1 + fft_size / 2;
  double bin_size = (double)sample_rate / fft_size;

  min_harmonic = max(1, min_harmonic);
  max_harmonic = max(1, max_harmonic);
  step = max(1, step);

  fftmag_t magnitude_buf[bins];
  fftmag_t prominence_buf[bins];

  magnitude(fft_buf, magnitude_buf, bins, TRUE);

  int start = round(min_pitch / bin_size);
  int end = round(max_pitch / bin_size);
  int scale_radius = ceil(f_scale_radius / bin_size);

  int peak = prominencepeak2(
    magnitude_buf, prominence_buf, bins,
    start, end, -1,
    fft_mag_min, fft_mag_max,
    prominence_threshold,
    MIN_FREQUENCY,
    FALSE
  );

  if (peak > 0) {
    double offset = interpolate_peak(magnitude_buf, bins, peak, NULL);
    double pitch = (peak + offset) * bin_size;
    int h = min_harmonic;
    if (h == 1 && h <= max_harmonic) {
      fft_scale(
        fft_buf, bins,
        peak, scale_radius,
        0.0, smooth_scale
      );
      h += step;
    }
    for (; h <= max_harmonic; h += step) {
      double f_min = (h - harmonic_search_radius) * pitch;
      double f_max = (h + harmonic_search_radius) * pitch;
      start = round(f_min / bin_size);
      end = round(f_max / bin_size);
      if (start > bins) {
        break;
      }
      peak = prominencepeak2(
        magnitude_buf, prominence_buf, bins,
        start, end, -1,
        fft_mag_min, fft_mag_max,
        0.0,
        MAX_PROMINENCE,
        FALSE
      );
      if (peak > 0) {
        fft_scale(
          fft_buf, bins,
          peak, scale_radius,
          0.0, smooth_scale
        );
      }
    }
  }
}

EMSCRIPTEN_KEEPALIVE
void add_harmonics(
  fftval_t *fft_buf,
  int fft_size,
  int sample_rate,
  float min_pitch,
  float max_pitch,
  int min_harmonic,
  int max_harmonic,
  int step,
  fftmag_t prominence_threshold,
  float f_copy_radius,
  float harmonic_search_radius,
  int smooth_copy
) {
  const fftmag_t fft_mag_min = DB_MIN;
  const fftmag_t fft_mag_max = DB_MAX;

  int bins = 1 + fft_size / 2;
  double bin_size = (double)sample_rate / fft_size;

  min_harmonic = max(1, min_harmonic);
  max_harmonic = max(1, max_harmonic);
  step = max(1, step);

  fftmag_t magnitude_buf[bins];
  fftmag_t prominence_buf[bins];

  magnitude(fft_buf, magnitude_buf, bins, TRUE);

  int start = round(min_pitch / bin_size);
  int end = round(max_pitch / bin_size);
  int copy_radius = ceil(f_copy_radius / bin_size);

  int peak = prominencepeak2(
    magnitude_buf, prominence_buf, bins,
    start, end, -1,
    fft_mag_min, fft_mag_max,
    prominence_threshold,
    MIN_FREQUENCY,
    FALSE
  );

  if (peak > 0) {
    double offset = interpolate_peak(magnitude_buf, bins, peak, NULL);
    double pitch = (peak + offset) * bin_size;
    double new_pitch = pitch * 0.5;
    int h = min_harmonic;
    if (h == 1 && h <= max_harmonic) {
      double new_harmonic = new_pitch;
      int new_peak = round(new_harmonic / bin_size);
      fft_copy(
        fft_buf, bins,
        peak, new_peak, copy_radius,
        1.0, smooth_copy
      );
      h += step;
    }
    for (; h <= max_harmonic; h += step) {
      double f_min = (h - harmonic_search_radius) * pitch;
      double f_max = (h + harmonic_search_radius) * pitch;
      start = round(f_min / bin_size);
      end = round(f_max / bin_size);
      if (start > bins) {
        break;
      }
      peak = prominencepeak2(
        magnitude_buf, prominence_buf, bins,
        start, end, -1,
        fft_mag_min, fft_mag_max,
        0.0,
        MAX_PROMINENCE,
        FALSE
      );
      if (peak > 0) {
        double new_harmonic = (h - 0.5) * pitch;
        int new_peak = round(new_harmonic / bin_size);
        fft_copy(
          fft_buf, bins,
          peak, new_peak, copy_radius,
          1.0, smooth_copy
        );
      }
    }
  }
}
