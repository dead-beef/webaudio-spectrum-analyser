#include "autocorr.h"

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
  memset(res, 0, length * sizeof(*res));
  for (int i = min_offset; i < max_offset; ++i) {
    res[i] = autocorr1(tdata, length, m, var, i);
  }
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
  int found_min = FALSE;

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
