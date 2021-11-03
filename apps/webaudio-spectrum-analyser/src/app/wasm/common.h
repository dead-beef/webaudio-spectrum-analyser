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

typedef enum {
  PM_NONE = 0,
  PM_CONST = 1,
  PM_LINEAR = 2,
} peakmask_t;

enum {
  TRUE = 1,
  FALSE = 0
};

typedef fftmag_t (*peakmask_func_t)(fftmag_t, fftmag_t);

double mean(tdval_t *data, int length);
double variance(tdval_t *data, int length, double mean);
double rms(tdval_t *data, int length);
double median(fftmag_t *data, int length);
double dot(fftmag_t *x, fftmag_t *y, int length);

int index_of_max_peak(fftmag_t *mag, int bin_count, int start, int end);
double interpolate_peak(fftmag_t *mag, int bin_count, int i, fftmag_t *value);
int is_peak(fftmag_t *mag, int bin_count, int i);

#endif
