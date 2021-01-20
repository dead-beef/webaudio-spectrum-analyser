#include "filter.h"

EMSCRIPTEN_KEEPALIVE
void filter(
  tdval_t *input,
  tdval_t *output,
  int length,
  int sample_rate
) {
  fftval_t ft[1 + length / 2];

  normalize(input, input, length);
  window(input, input, length);
  fft(input, ft, length);

  double bin_size = (double)sample_rate / length;

  for (int i = 0; i <= length / 2; ++i) {
    double frequency = i * bin_size;
    if (frequency > 1000 && frequency < 5000) {
      ft[i].r = 0;
      ft[i].i = 0;
    }
  }

  ifft(ft, output, length);
}
