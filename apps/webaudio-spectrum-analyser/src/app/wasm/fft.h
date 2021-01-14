#ifndef FFT_H_INCLUDED
#define FFT_H_INCLUDED

#define NDEBUG 1
#define kiss_fft_scalar float
#include <kissfft/kiss_fft.h>
#include <kissfft/tools/kiss_fftr.h>

void window(kiss_fft_scalar *in, kiss_fft_scalar *out, int length);

#endif
