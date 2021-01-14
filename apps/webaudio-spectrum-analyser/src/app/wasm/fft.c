#include "fft.h"

#include <kissfft/kiss_fft.c>
#include <kissfft/tools/kiss_fftr.c>

void window(kiss_fft_scalar *in, kiss_fft_scalar *out, int length) {
  kiss_fft_scalar n = length - 1;
  for (int i = 0; i < length; ++i) {
    kiss_fft_scalar w = 0.5 * (1.0 - cos(2.0 * M_PI * i / n));
    out[i] = in[i] * w;
  }
}
