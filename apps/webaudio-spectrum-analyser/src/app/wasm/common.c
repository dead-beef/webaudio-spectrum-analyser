#include "common.h"

#include <math.h>
#include <stdlib.h>

number mean(const number *data, int length) {
  number sum = 0.0;
  for (int i = 0; i < length; ++i) {
    sum += data[i];
  }
  return sum / length;
}

number variance(const number *data, int length, number mean) {
  number sum = 0.0;
  for (int i = 0; i < length; ++i) {
    number val = data[i] - mean;
    sum += val * val;
  }
  return sum / length;
}

EMSCRIPTEN_KEEPALIVE
number rms(const number *data, int length) {
  number sum = 0.0;
  for (int i = 0; i < length; ++i) {
    sum += data[i] * data[i];
  }
  return sqrt(sum / length);
}

static int cmp(const void *x, const void *y) {
  return copysign(1.0, *(number*)x - *(number*)y);
}

number median(number *data, int length) {
  if (length <= 0) {
    return 0.0;
  }
  qsort(data, length, sizeof(*data), cmp);
  number ret;
  int mid = length / 2;
  if (length % 2) {
    ret = data[mid];
  } else {
    ret = (data[mid] + data[mid - 1]) * 0.5;
  }
  return ret;
}

number dot(const number *x, const number *y, int length) {
  number res = 0.0;
  for (int i = 0; i < length; ++i) {
    res += x[i] * y[i];
  }
  return res;
}

int is_peak(const number *data, int length, int i) {
  if (i <= 0 || i >= length - 1) {
    return FALSE;
  }
  return data[i] >= data[i - 1] && data[i] > data[i + 1];
}

int index_of_max_peak(const number *data, int length, int start, int end) {
  int ret = -1;
  number val;
  start = clamp(start, 1, length - 2);
  end = clamp(end, 1, length - 2);
  for (int i = start; i <= end; ++i) {
    if (data[i] >= data[i - 1]
        && data[i] > data[i + 1]
        && (ret < 0 || val < data[i])
    ) {
      ret = i;
      val = data[i];
    }
  }
  return ret;
}

number interpolate_peak(const number *data, int length, int i, number *value) {
  if (i <= 0 || i >= length - 1) {
    if (value) {
      *value = data[i];
    }
    return 0.0;
  }
  number left = data[i - 1];
  number peak = data[i];
  number right = data[i + 1];

  number c = peak;
  number b = (right - left) / 2.0;
  number a = left + b - c;

  number x = -b / (2.0 * a);
  if (value) {
    *value = x * (a * x + b) + c;
  }

  return x;
}
