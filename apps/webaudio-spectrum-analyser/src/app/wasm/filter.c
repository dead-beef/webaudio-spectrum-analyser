#include "filter.h"

EMSCRIPTEN_KEEPALIVE
void filter(
  tdval_t *input,
  tdval_t *output,
  int length,
  int sample_rate
) {
  int bins = length / 2;
  fftval_t ft[1 + bins];

  normalize(input, input, length);
  window(input, input, length);
  fft(input, ft, length);

  fftmag_t mag[1 + bins];

  for (int i = 0; i <= bins; ++i) {
    mag[i] = sqrt(ft[i].r * ft[i].r + ft[i].i * ft[i].i);
  }

  double bin_size = (double)sample_rate / length;

  fftmag_t max_mag = 0;
  double max_mag_f = 110.0;

  /*for (int i = 0; i <= bins; ++i) {
    double f = i * bin_size;
    if (f > 400.0) {
      break;
    }
    if (f < 100.0) {
      continue;
    }
    if (mag[i] > max_mag) {
      max_mag = mag[i];
      max_mag_f = f;
    }
    }*/

  /*double fr = 210.0;
  double amount = 1.0;

  for (int i = 1; i <= bins; ++i) {
    double f = i * bin_size;

    double s = 2.0 * (1.0 - fabs(cos(M_PI * f / max_mag_f)));

    s *= 2 * fabs(cos(M_PI * f / fr));

    amount = exp(20 * -(i - 1) / bins);

    ft[i].r *= amount * s + (1.0 - amount);
    ft[i].i *= amount * s + (1.0 - amount);
    }*/

  ifft(ft, output, length);
}
