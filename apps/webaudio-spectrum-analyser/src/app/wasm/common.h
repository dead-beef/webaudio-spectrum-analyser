#ifndef COMMON_H_INCLUDED
#define COMMON_H_INCLUDED

#include <emscripten.h>
#include <string.h>

#define EPS 0.01

#define clamp(x, min, max) ((x) < (min) ? (min) : (x) > (max) ? (max) : (x))
#define max(x, y) ((x) > (y) ? (x) : (y))
#define min(x, y) ((x) > (y) ? (y) : (x))

typedef float tdval_t;
typedef float fftmag_t;

typedef enum {
  MIN_FREQUENCY = 1,
  MAX_PROMINENCE = 2,
} fftpeak_t;

enum {
  TRUE = 1,
  FALSE = 0
};

double mean(tdval_t *data, int length);
double variance(tdval_t *data, int length, double mean);
double rms(tdval_t *data, int length);

#endif
