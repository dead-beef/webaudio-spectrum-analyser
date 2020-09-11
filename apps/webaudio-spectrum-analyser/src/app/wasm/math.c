#include <emscripten.h>

#define EPS 0.01

#define clamp(x, min, max) ((x) < (min) ? (min) : (x) > (max) ? (max) : (x))
#define max(x, y) ((x) > (y) ? (x) : (y))
#define min(x, y) ((x) > (y) ? (y) : (x))

typedef unsigned char tdval_t;
typedef unsigned char fftval_t;

typedef enum {
  MIN_FREQUENCY = 1,
  MAX_MAGNITUDE = 2,
  MAX_PROMINENCE = 3,
} fftpeak_t;

typedef enum {
  TRUE = 1,
  FALSE = 0
} bool;

enum {
  FFTVAL_MIN = 0
};


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


double autocorr1(
  tdval_t *tdata,
  int length,
  double mean,
  double variance,
  int offset
) {
  double res = 0.0;
  for (int i = offset; i < length; ++i) {
    res += (tdata[i] - mean) * (tdata[i - offset] - mean);
  }
  res /= (length - offset) * variance;
  return clamp(res, -1.0, 1.0);
}

EMSCRIPTEN_KEEPALIVE
void autocorr(
  tdval_t *tdata,
  float *res,
  int length,
  int min_offset,
  int max_offset
) {
  double m = mean(tdata, length);
  double var = variance(tdata, length, m);
  int i = 0;
  for (; i < min_offset; res[i] = 0.0, ++i);
  for (; i < max_offset; ++i) {
    res[i] = autocorr1(tdata, length, m, var, i);
  }
  for (; i < length; res[i] = 0.0, ++i);
}

EMSCRIPTEN_KEEPALIVE
int autocorrpeak(
  tdval_t *tdata,
  float *acdata,
  int length,
  int min_offset,
  int max_offset
) {
  max_offset = clamp(max_offset, 0, length - 1);
  min_offset = clamp(min_offset, 0, max_offset - 1);
  if (max_offset - min_offset < 4) {
    return -1;
  }

  autocorr(tdata, acdata, length, min_offset, max_offset);

  int res = -1;
  float max = -2.0;
  bool found_min = FALSE;

  ++min_offset;
  --max_offset;

  for (int i = min_offset; i < max_offset; ++i) {
    float cur = acdata[i];
    float prev = acdata[i - 1];
    float next = acdata[i + 1];
    //if(cur == prev && cur == next) {
    //  continue;
    //}
    if (found_min) {
      if (cur >= prev && cur >= next && max < cur - EPS) {
        res = i;
        max = cur;
      }
    } else if (cur <= prev && cur <= next && cur < 0.0) {
      found_min = TRUE;
    }
  }

  return res;
}


EMSCRIPTEN_KEEPALIVE
void prominence(
  fftval_t *fft,
  fftval_t *res,
  int length,
  int start,
  int end,
  int radius
) {
  start = clamp(start, 1, length - 1);
  end = clamp(end, 1, length - 1);
  if (radius < 1) {
    radius = length;
  }
  int i = 0;
  for (; i < start; res[i] = 0, ++i);
  for (; i < end; ++i) {
    fftval_t cur = fft[i];
    fftval_t left = cur;
    fftval_t right = cur;
    if (fft[i] >= fft[i - 1] && fft[i] >= fft[i + 1]) {
      int start = i - radius;
      int end = i + radius;
      int j;
      if (start < 0) {
        start = 0;
      }
      if (end >= length) {
        end = length - 1;
      }
      for (j = i - 1; j >= start && fft[j] <= cur; --j) {
        if (fft[j] < left) {
          left = fft[j];
        }
      }
      if (j < start) {
        left = FFTVAL_MIN;
      }
      for (j = i + 1; j <= end && fft[j] <= cur; ++j) {
        if (fft[j] < right) {
          right = fft[j];
        }
      }
      if (j > end) {
        right = FFTVAL_MIN;
      }
    }
    res[i] = cur - max(left, right);
  }
  for (; i < length; res[i] = 0, ++i);
}

EMSCRIPTEN_KEEPALIVE
int prominencepeak(
  fftval_t *fft,
  fftval_t *prdata,
  int length,
  int start,
  int end,
  int radius,
  fftval_t threshold,
  fftpeak_t type
) {
  start = clamp(start, 1, length - 1);
  end = clamp(end, 1, length - 1);
  if (radius < 1) {
    radius = length;
  }

  prominence(fft, prdata, length, start, end, radius);

  fftval_t max = FFTVAL_MIN;
  int res = -1;
  for (int i = start; i < end; ++i) {
    if (prdata[i] < threshold) {
      continue;
    }
    fftval_t value;
    switch (type) {
      case MAX_PROMINENCE:
        value = prdata[i];
        break;
      case MAX_MAGNITUDE:
        value = fft[i];
        break;
      case MIN_FREQUENCY:
        return i;
      default:
        return -1;
    }
    if (value > max) {
      max = value;
      res = i;
    }
  }
  return res;
}
