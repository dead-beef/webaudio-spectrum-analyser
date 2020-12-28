#ifndef COMMON_H_INCLUDED
#define COMMON_H_INCLUDED

#include <emscripten.h>
#include <string.h>

#define EPS 0.01

#define clamp(x, min, max) ((x) < (min) ? (min) : (x) > (max) ? (max) : (x))
#define max(x, y) ((x) > (y) ? (x) : (y))
#define min(x, y) ((x) > (y) ? (y) : (x))

typedef unsigned char tdval_t;
typedef unsigned char fftval_t;

typedef enum {
  MIN_FREQUENCY = 1,
  MAX_MAGNITUDE = 2,
  MAX_PROMINENCE = 3,
} fftpeak_t;

typedef enum {
  TRUE = 1,
  FALSE = 0
} bool;

enum {
  FFTVAL_MIN = 0,
  FFTVAL_MAX = 255
};

double mean(tdval_t *data, int length);
double variance(tdval_t *data, int length, double mean);
fftval_t max_magnitude(fftval_t *fft, int start, int end);

#endif