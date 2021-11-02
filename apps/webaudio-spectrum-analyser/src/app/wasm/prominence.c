#include "prominence.h"
#include "fft.h"

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
  int normalize
) {
  start = clamp(start, 1, length - 2);
  end = clamp(end, 1, length - 2);
  if (radius < 1) {
    radius = length;
  }

  memset(res, 0, length * sizeof(*res));

  for (int i = start; i <= end; ++i) {
    fftmag_t cur = fft[i];
    fftmag_t left = fft[i - 1];
    fftmag_t right = fft[i + 1];
    if (cur < left || cur < right || cur <= fftmag_min) {
      continue;
    }
    int start;
    int end;
    int j;
    if (radius <= 0) {
      start = 0;
      end = length - 1;
    } else {
      start = max(0, i - radius);
      end = min(i + radius, length - 1);
    }
    for (j = i - 2; j >= start && fft[j] <= cur; --j) {
      if (fft[j] < left && (left = fft[j]) <= fftmag_min) {
        break;
      }
    }
    if (j < start) {
      left = fftmag_min;
    }
    for (j = i + 2; j <= end && fft[j] <= cur; ++j) {
      if (fft[j] < right && (right = fft[j]) <= fftmag_min) {
        break;
      }
    }
    if (j > end) {
      right = fftmag_min;
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
  fftmag_t *prdata,
  int length,
  int start,
  int end,
  fftmag_t threshold,
  fftpeak_t type
) {
  start = clamp(start, 1, length - 2);
  end = clamp(end, 1, length - 2);
  fftmag_t max;
  int res = -1;
  for (int i = start; i <= end; ++i) {
    if (prdata[i] < threshold) {
      continue;
    }
    fftmag_t value;
    switch (type) {
      case MAX_PROMINENCE:
        value = prdata[i];
        break;
      case MIN_FREQUENCY:
        return i;
      default:
        return -1;
    }
    if (res < 0 || value > max) {
      max = value;
      res = i;
    }
  }
  return res;
}

int prominencepeak2(
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
  int normalize
) {
  prominence(
    fft, prdata, length,
    start, end, radius,
    fftmag_min, fftmag_max,
    normalize
  );
  return prominencepeak(prdata, length, start, end, threshold, type);
}
