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

number mean(const number *data, int length);
number variance(const number *data, int length, number mean);
number rms(const number *data, int length);
number median(number *data, int length);
number dot(const number *x, const number *y, int length);

int index_of_max_peak(const number *data, int length, int start, int end);
number interpolate_peak(const number *data, int length, int i, number *value);
int is_peak(const number *data, int length, int i);

#endif
