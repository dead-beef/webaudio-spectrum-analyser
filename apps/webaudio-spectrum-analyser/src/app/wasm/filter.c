#include "filter.h"

EMSCRIPTEN_KEEPALIVE
void filter(
  kiss_fft_cpx *input,
  tdval_t *output,
  int inputSize,
  int outputSize,
  int sampleRate
) {
  kiss_fft_cpx ifft[inputSize];
  kiss_fft_cpx fft[inputSize];
  kiss_fft_cpx _cfg[2 * inputSize];
  size_t cfg_size = sizeof(_cfg);
  kiss_fft_cfg cfg = (kiss_fft_cfg)(_cfg);

  cfg = kiss_fft_alloc(inputSize, FALSE, cfg, &cfg_size);
  kiss_fft(cfg, input, fft);

  cfg = kiss_fft_alloc(inputSize, TRUE, cfg, &cfg_size);
  kiss_fft(cfg, fft, ifft);

  int offset = inputSize - outputSize;
  for (int i = 0; i < outputSize; ++i) {
    output[i] = ifft[offset + i].r / inputSize;
  }
}
