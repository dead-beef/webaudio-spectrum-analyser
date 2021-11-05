#ifndef FFT_H_INCLUDED
#define FFT_H_INCLUDED

#include "common.h"

#ifdef CLI
#define NDEBUG 0
#else
#define NDEBUG 1
#endif
#define KISS_FFT_MALLOC no_fft_malloc
#define KISS_FFT_FREE no_fft_free
#define kiss_fft_scalar number
//#define fftval_t kiss_fft_cpx
#include <kissfft/kiss_fft.h>
//#include <kissfft/tools/kiss_fftr.h>

#define DB_MIN -100
#define DB_MAX 0
#define DB_REF 1

typedef number tdval_t;
typedef number fftmag_t;
typedef kiss_fft_cpx fftval_t;

typedef enum {
  MIN_FREQUENCY = 1,
  MAX_PROMINENCE = 2,
} fftpeak_t;

typedef enum {
  PM_NONE = 0,
  PM_CONST = 1,
  PM_LINEAR = 2,
} peakmask_t;

typedef number (*peakmask_func_t)(number, number);

void normalize(const tdval_t *in, tdval_t *out, int length);

void window(const tdval_t *in, tdval_t *out, int length);

void fft(const tdval_t *in, fftval_t *out, int length);

void ifft(const fftval_t *in, tdval_t *out, int length);

void cepstrum(fftmag_t *fft_buf, fftmag_t *out, int fft_size);

void smooth_fft_val(
  const fftval_t *next,
  fftval_t *cur,
  int length,
  number factor
);

void smooth_fft_mag(
  const fftmag_t *next,
  fftmag_t *cur,
  int length,
  number factor
);

void magnitude(const fftval_t *in, fftmag_t *out, int length, int decibels);

fftmag_t max_magnitude(const fftmag_t *fft, int start, int end);

int fftpeaks(
  const fftmag_t *data,
  number *output,
  int length,
  peakmask_t mask,
  number mask_radius
);

void fft_scale(
  fftval_t *fft_buf,
  int length,
  int i,
  int radius,
  number factor,
  int smooth
);

void fft_copy(
  fftval_t *fft_buf,
  int length,
  int src,
  int dst,
  int radius,
  number scale,
  int smooth
);

#endif
