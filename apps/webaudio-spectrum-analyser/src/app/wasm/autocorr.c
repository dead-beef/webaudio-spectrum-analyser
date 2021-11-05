#include "autocorr.h"

static number autocorr1(
  const number *tdata,
  int length,
  number mean,
  number variance,
  int offset
) {
  number res = 0.0;
  for (int i = offset; i < length; ++i) {
    res += (tdata[i] - mean) * (tdata[i - offset] - mean);
  }
  res /= (length - offset) * variance;
  return clamp(res, -1.0, 1.0);
}

EMSCRIPTEN_KEEPALIVE
void autocorr(
  const number *tdata,
  number *res,
  int length,
  int min_offset,
  int max_offset
) {
  max_offset = clamp(max_offset, 0, length - 2);
  min_offset = clamp(min_offset, 0, max_offset - 1);
  number m = mean(tdata, length);
  number var = variance(tdata, length, m);
  memset(res, 0, length * sizeof(*res));
  for (int i = min_offset; i <= max_offset; ++i) {
    res[i] = autocorr1(tdata, length, m, var, i);
  }
}

EMSCRIPTEN_KEEPALIVE
int autocorrpeak(
  const number *acdata,
  int length,
  int min_offset,
  int max_offset
) {
  max_offset = clamp(max_offset, 0, length - 2);
  min_offset = clamp(min_offset, 0, max_offset - 1);
  if (max_offset - min_offset < 4) {
    return -1;
  }

  int res = -1;
  number max = 0.0;
  int found_min = FALSE;

  //++min_offset;
  //--max_offset;

  for (int i = min_offset; i <= max_offset; ++i) {
    number cur = acdata[i];
    number prev = acdata[i - 1];
    number next = acdata[i + 1];
    //if(cur == prev && cur == next) {
    //  continue;
    //}
    if (found_min) {
      if (cur >= prev && cur >= next && max < cur - EPS) {
        res = i;
        max = cur;
      }
    } else if (cur <= prev && cur <= next && cur < EPS) {
      found_min = TRUE;
    }
  }

  return res;
}
