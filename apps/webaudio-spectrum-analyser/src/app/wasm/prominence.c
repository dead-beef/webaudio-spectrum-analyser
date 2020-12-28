#include "prominence.h"

EMSCRIPTEN_KEEPALIVE
void prominence(
  fftval_t *fft,
  fftval_t *res,
  int length,
  int start,
  int end,
  int radius,
  bool normalize
) {
  start = clamp(start, 1, length - 1);
  end = clamp(end, 1, length - 1);
  if (radius < 1) {
    radius = length;
  }

  memset(res, 0, length * sizeof(*res));

  fftval_t max_mag = FFTVAL_MIN;
  if (normalize) {
    max_mag = max_magnitude(fft, start, end);
    if (max_mag == FFTVAL_MIN) {
      return;
    }
  }

  for (int i = start; i < end; ++i) {
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
    if (normalize) {
      res[i] = (unsigned)res[i] * FFTVAL_MAX / max_mag;
    }
  }
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
  fftpeak_t type,
  bool normalize
) {
  start = clamp(start, 1, length - 1);
  end = clamp(end, 1, length - 1);
  if (radius < 1) {
    radius = length;
  }

  prominence(fft, prdata, length, start, end, radius, normalize);

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
