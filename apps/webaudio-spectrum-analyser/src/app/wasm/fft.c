#include "fft.h"

#include <kissfft/kiss_fft.c>
#include <kissfft/tools/kiss_fftr.c>

void normalize(tdval_t *in, tdval_t *out, int length) {
  for (int i = 0; i < length; ++i) {
    out[i] = in[i] / length;
  }
}

void window(tdval_t *in, tdval_t *out, int length) {
  tdval_t n = length - 1;
  for (int i = 0; i < length; ++i) {
    tdval_t w = 0.5 * (1.0 - cos(2.0 * M_PI * i / n));
    out[i] = in[i] * w;
  }
}

void fft(tdval_t *in, fftval_t *out, int length) {
  kiss_fft_cpx _cfg_alloc[2 * length];
  size_t cfg_size = sizeof(_cfg_alloc);
  kiss_fftr_cfg cfg = (kiss_fftr_cfg)(_cfg_alloc);
  cfg = kiss_fftr_alloc(length, FALSE, cfg, &cfg_size);
  kiss_fftr(cfg, in, out);
}

void ifft(fftval_t *in, tdval_t *out, int length) {
  kiss_fft_cpx _cfg_alloc[2 * length];
  size_t cfg_size = sizeof(_cfg_alloc);
  kiss_fftr_cfg cfg = (kiss_fftr_cfg)(_cfg_alloc);
  cfg = kiss_fftr_alloc(length, TRUE, cfg, &cfg_size);
  kiss_fftri(cfg, in, out);
}
