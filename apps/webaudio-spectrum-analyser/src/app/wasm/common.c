#include "common.h"

#include <math.h>
#include <stdlib.h>

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

EMSCRIPTEN_KEEPALIVE
double rms(tdval_t *data, int length) {
  double sum = 0.0;
  for (int i = 0; i < length; ++i) {
    sum += data[i] * data[i];
  }
  return sqrt(sum / length);
}

static int cmp(const void *x, const void *y) {
  return copysign(1.0, *(fftmag_t*)x - *(fftmag_t*)y);
}

double median(fftmag_t *data, int length) {
  if (length <= 0) {
    return 0.0;
  }
  qsort(data, length, sizeof(*data), cmp);
  double ret;
  int mid = length / 2;
  if (length % 2) {
    ret = data[mid];
  } else {
    ret = (data[mid] + data[mid - 1]) * 0.5;
  }
  return ret;
}

double dot(fftmag_t *x, fftmag_t *y, int length) {
  double res = 0.0;
  for (int i = 0; i < length; ++i) {
    res += x[i] * y[i];
  }
  return res;
}

int is_peak(fftmag_t *mag, int bin_count, int i) {
  if (i <= 0 || i >= bin_count - 1) {
    return FALSE;
  }
  return mag[i] >= mag[i - 1] && mag[i] > mag[i + 1];
}

int index_of_max_peak(fftmag_t *mag, int bin_count, int start, int end) {
  int ret = -1;
  fftmag_t val;
  start = clamp(start, 1, bin_count - 2);
  end = clamp(end, 1, bin_count - 2);
  for (int i = start; i <= end; ++i) {
    if (is_peak(mag, bin_count, i)) {
      if (ret < 0 || val < mag[i]) {
        ret = i;
        val = mag[i];
      }
    }
  }
  return ret;
}

double interpolate_peak(fftmag_t *mag, int bin_count, int i, fftmag_t *value) {
  if (i <= 0 || i >= bin_count - 1) {
    if (value) {
      *value = mag[i];
    }
    return 0.0;
  }
  fftmag_t left = mag[i - 1];
  fftmag_t peak = mag[i];
  fftmag_t right = mag[i + 1];

  double c = peak;
  double b = (right - left) / 2.0;
  double a = left + b - c;

  double x = -b / (2.0 * a);
  if (value) {
    *value = x * (a * x + b) + c;
  }

  return x;
}
