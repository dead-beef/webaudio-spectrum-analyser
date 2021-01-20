#ifndef FFT_H_INCLUDED
#define FFT_H_INCLUDED

#define NDEBUG 1
#define kiss_fft_scalar tdval_t
#define fftval_t kiss_fft_cpx
#include <kissfft/kiss_fft.h>
#include <kissfft/tools/kiss_fftr.h>

void normalize(tdval_t *in, tdval_t *out, int length);

void window(tdval_t *in, tdval_t *out, int length);

void fft(tdval_t *in, fftval_t *out, int length);

void ifft(fftval_t *in, tdval_t *out, int length);

#endif
