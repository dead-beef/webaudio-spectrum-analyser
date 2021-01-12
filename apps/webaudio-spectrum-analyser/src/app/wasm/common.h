#ifndef COMMON_H_INCLUDED
#define COMMON_H_INCLUDED

#include <emscripten.h>
#include <string.h>

#define EPS 0.01
#define FFTVAL_MIN 0.0
#define FFTVAL_MAX 1.0

#define clamp(x, min, max) ((x) < (min) ? (min) : (x) > (max) ? (max) : (x))
#define max(x, y) ((x) > (y) ? (x) : (y))
#define min(x, y) ((x) > (y) ? (y) : (x))

typedef float tdval_t;
typedef float fftval_t;

typedef enum {
  MIN_FREQUENCY = 1,
  MAX_MAGNITUDE = 2,
  MAX_PROMINENCE = 3,
} fftpeak_t;

typedef enum {
  TRUE = 1,
  FALSE = 0
} bool;

double mean(tdval_t *data, int length);
double variance(tdval_t *data, int length, double mean);
fftval_t max_magnitude(fftval_t *fft, int start, int end);

#endif
