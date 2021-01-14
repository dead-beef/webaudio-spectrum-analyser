#include "filter.h"

EMSCRIPTEN_KEEPALIVE
void filter(
  tdval_t *input,
  tdval_t *output,
  int length,
  int sample_rate
) {
  kiss_fft_scalar windowed[length];
  kiss_fft_cpx fft[1 + length / 2];
  kiss_fft_cpx _cfg_alloc[2 * length];
  size_t cfg_size = sizeof(_cfg_alloc);
  kiss_fftr_cfg cfg = (kiss_fftr_cfg)(_cfg_alloc);

  for (int i = 0; i < length; ++i) {
    input[i] /= length;
  }
  window(input, windowed, length);

  cfg = kiss_fftr_alloc(length, FALSE, cfg, &cfg_size);
  kiss_fftr(cfg, windowed, fft);

  kiss_fft_scalar bin_size = (kiss_fft_scalar)sample_rate / length;

  for (int i = 50; i <= length / 2; ++i) {
    fft[i].r = 0;
    fft[i].i = 0;
  }

  cfg = kiss_fftr_alloc(length, TRUE, cfg, &cfg_size);
  kiss_fftri(cfg, fft, output);
}
