#include <emscripten.h>

#define clamp(x, min, max) (x) < (min) ? (min) : (x) > (max) ? (max) : (x)

typedef unsigned char tdval_t;
typedef unsigned char fftval_t;

double mean(tdval_t *data, int length) {
  if (length <= 0) {
    return 0.0;
  }
  double sum = 0.0;
  for (int i = 0; i < length; ++i) {
    sum += data[i];
  }
  return sum / length;
}

double variance(tdval_t *data, int length, double mean) {
  if (length <= 0) {
    return 0.0;
  }
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
  int minOffset,
  int maxOffset
) {
  double m = mean(tdata, length);
  double var = variance(tdata, length, m);

  maxOffset = clamp(maxOffset, 0, length - 1);
  minOffset = clamp(minOffset, 0, maxOffset - 1);

  int i = 0;
  for (; i < minOffset; res[i] = 0.0, ++i);
  for (; i < maxOffset; ++i) {
    res[i] = autocorr1(tdata, length, m, var, i);
  }
  for (; i < length; res[i] = 0.0, ++i);
}
