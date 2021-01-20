#include "prominence.h"

EMSCRIPTEN_KEEPALIVE
void prominence(
  fftmag_t *fft,
  fftmag_t *res,
  int length,
  int start,
  int end,
  int radius,
  fftmag_t fftmag_min,
  fftmag_t fftmag_max,
  bool normalize
) {
  start = clamp(start, 1, length - 1);
  end = clamp(end, 1, length - 1);
  if (radius < 1) {
    radius = length;
  }

  memset(res, 0, length * sizeof(*res));

  for (int i = start; i < end; ++i) {
    fft[i] = clamp(fft[i], fftmag_min, fftmag_max);
  }

  for (int i = start; i < end; ++i) {
    fftmag_t cur = fft[i];
    fftmag_t left = cur;
    fftmag_t right = cur;
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
        left = fftmag_min;
      }
      for (j = i + 1; j <= end && fft[j] <= cur; ++j) {
        if (fft[j] < right) {
          right = fft[j];
        }
      }
      if (j > end) {
        right = fftmag_min;
      }
    }
    res[i] = cur - max(left, right);
  }

  if (normalize) {
    float scale = (fftmag_max - fftmag_min) / max_magnitude(res, start, end);
    for (int i = start; i < end; ++i) {
      res[i] = res[i] * scale;
    }
  }
}

EMSCRIPTEN_KEEPALIVE
int prominencepeak(
  fftmag_t *fft,
  fftmag_t *prdata,
  int length,
  int start,
  int end,
  int radius,
  fftmag_t fftmag_min,
  fftmag_t fftmag_max,
  fftmag_t threshold,
  fftpeak_t type,
  bool normalize
) {
  start = clamp(start, 1, length - 1);
  end = clamp(end, 1, length - 1);
  if (radius < 1) {
    radius = length;
  }

  prominence(
    fft,
    prdata,
    length,
    start,
    end,
    radius,
    fftmag_min,
    fftmag_max,
    normalize
  );

  fftmag_t max = fftmag_min;
  int res = -1;
  for (int i = start; i < end; ++i) {
    if (prdata[i] < threshold) {
      continue;
    }
    fftmag_t value;
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
