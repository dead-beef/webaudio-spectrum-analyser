#include "common.h"

#include <math.h>

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

double rms(tdval_t *data, int length) {
  double sum = 0.0;
  for (int i = 0; i < length; ++i) {
    sum += data[i] * data[i];
  }
  return sqrt(sum / length);
}
