#ifndef COMMON_H_INCLUDED
#define COMMON_H_INCLUDED

#include <emscripten.h>
#include <string.h>

#define EPS 0.01

#define clamp(x, min, max) ((x) < (min) ? (min) : (x) > (max) ? (max) : (x))
#define max(x, y) ((x) > (y) ? (x) : (y))
#define min(x, y) ((x) > (y) ? (y) : (x))

typedef float number;

enum {
  TRUE = 1,
  FALSE = 0
};

number mean(number *data, int length);
number variance(number *data, int length, number mean);
number rms(number *data, int length);
number median(number *data, int length);
number dot(number *x, number *y, int length);

int index_of_max_peak(number *mag, int bin_count, int start, int end);
number interpolate_peak(number *mag, int bin_count, int i, number *value);
int is_peak(number *mag, int bin_count, int i);

#endif
