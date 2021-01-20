#include "common.h"

double mean(tdval_t *data, int length) {
  double sum = 0.0;
  for (int i = 0; i < length; ++i) {
    sum += data[i];
  }
  return sum / length;
}

double variance(tdval_t *data, int length, double mean) {
  double sum = 0.0;
  for (int i = 0; i < length; ++i) {
    double val = data[i] - mean;
    sum += val * val;
  }
  return sum / length;
}

fftmag_t max_magnitude(fftmag_t *fft, int start, int end) {
  if (start >= end) {
    return 0;
  }
  fftmag_t ret = fft[start];
  for (int i = start + 1; i < end; ++i) {
    if (fft[i] > ret) {
      ret = fft[i];
    }
  }
  return ret;
}
