#include "prominence.h"
#include "fft.h"

EMSCRIPTEN_KEEPALIVE
void prominence(
  const fftmag_t *fft,
  const fftmag_t *peaks,
  number *res,
  int bin_count,
  int peak_count,
  int start,
  int end,
  int radius,
  int normalize
) {
  start = clamp(start, 1, bin_count - 2);
  end = clamp(end, 1, bin_count - 2);
  if (radius < 1) {
    radius = bin_count;
  }

  memset(res, 0, bin_count * sizeof(*res));

  for (int p = 0; p < peak_count; ++p) {
    int i = round(peaks[p * 2]);
    if (i < start) {
      continue;
    }
    if (i > end) {
      break;
    }

    fftmag_t cur = fft[i];
    fftmag_t left = fft[i - 1];
    fftmag_t right = fft[i + 1];

    int start_;
    int end_;
    int j;
    if (radius <= 0) {
      start_ = 0;
      end_ = bin_count - 1;
    } else {
      start_ = max(0, i - radius);
      end_ = min(i + radius, bin_count - 1);
    }

    for (j = i - 2; j >= start_ && fft[j] <= cur; --j) {
      if (fft[j] < left && (left = fft[j]) <= DB_MIN) {
        break;
      }
    }
    if (j < start_) {
      left = DB_MIN;
    }

    for (j = i + 2; j <= end_ && fft[j] <= cur; ++j) {
      if (fft[j] < right && (right = fft[j]) <= DB_MIN) {
        break;
      }
    }
    if (j > end_) {
      right = DB_MIN;
    }

    res[i] = cur - max(left, right);
  }

  if (normalize) {
    fftmag_t scale = (DB_MAX - DB_MIN) / max_magnitude(res, start, end);
    for (int i = start; i < end; ++i) {
      res[i] *= scale;
    }
  }
}

EMSCRIPTEN_KEEPALIVE
int prominencepeak(
  const fftmag_t *prdata,
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
    if (prdata[i] <= threshold) {
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
