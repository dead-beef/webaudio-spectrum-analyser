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

fftval_t max_magnitude(fftval_t *fft, int start, int end) {
  fftval_t ret = FFTVAL_MIN;
  for (int i = start; i < end; ++i) {
    if (fft[i] > ret) {
      ret = fft[i];
    }
  }
  return ret;
}
