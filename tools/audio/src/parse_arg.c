#include "parse_arg.h"
#include "error.h"
#include "log.h"
#include "util.h"

#include <stdio.h>
#include <string.h>
#include <errno.h>


static int _parse_fmt_arg(
  const char *opt,
  const char *arg,
  const char *fmt,
  void *val,
  const char *type_name
) {
  HANDLE_RC(parse_fmt(arg, val, fmt, type_name), "Invalid argument for option %s: \"%s\"", opt, arg);
  return 0;
ON_ERROR
  return -1;
}

static int _next_arg(int argc, char **argv, int *i) {
  if (*i + 1 >= argc) {
    ERROR("Option %s requires an argument", argv[*i]);
  }
  ++*i;
  return 0;
ON_ERROR
  return -1;
}

int parse_fmt_arg(
  int argc,
  char **argv,
  int *i,
  void *val,
  const char *fmt,
  const char *type_name
) {
  const char *opt = argv[*i];
  HANDLE_RC(_next_arg(argc, argv, i), NULL);
  HANDLE_RC(_parse_fmt_arg(opt, argv[*i], fmt, val, type_name), NULL);
  return 0;
ON_ERROR
  return -1;
}

int parse_fmt_args(
  int argc,
  char **argv,
  int *i,
  void **vals,
  int val_count,
  const char *fmt,
  const char *type_name
) {
  const char *opt = argv[*i];
  if (*i + val_count >= argc) {
    ERROR("Option %s requires %d arguments", opt, val_count);
  }
  for(int j = 0; j < val_count; ++j) {
    ++*i;
    HANDLE_RC(_parse_fmt_arg(opt, argv[*i], fmt, vals[j], type_name), NULL);
  }
  return 0;
ON_ERROR
  return -1;
}

int parse_int_arg(int argc, char **argv, int *i, int *val) {
  return parse_fmt_arg(argc, argv, i, val, "%d%c", "int");
}

int parse_int_args(int argc, char **argv, int *i, int **vals, int val_count) {
  return parse_fmt_args(argc, argv, i, (void**)vals, val_count, "%d%c", "int");
}

int parse_float_arg(int argc, char **argv, int *i, float *val) {
  return parse_fmt_arg(argc, argv, i, val, "%f%c", "float");
}

int parse_float_args(int argc, char **argv, int *i, float **vals, int val_count) {
  return parse_fmt_args(argc, argv, i, (void**)vals, val_count, "%f%c", "float");
}

int parse_fft_size_arg(int argc, char **argv, int *i, int *val) {
  HANDLE_RC(parse_int_arg(argc, argv, i, val), NULL);
  if (*val < 2) {
    ERROR("Invalid fft size: %d: less than 2", *val);
  }
  if (*val & (*val - 1)) {
    ERROR("Invalid fft size: %d: not a power of 2", *val);
  }
  return 0;
ON_ERROR
  return -1;
}

int parse_enum_arg(
  int argc,
  char **argv,
  int *i,
  int *val,
  const enum_val_t *values,
  const char *type_name
) {
  const char *opt = argv[*i];
  HANDLE_RC(_next_arg(argc, argv, i), NULL);
  const char *arg = argv[*i];
  for (const enum_val_t *p = values; p->string != NULL; ++p) {
    if (!strcmp(arg, p->string)) {
      *val = p->value;
      return 0;
    }
  }
  ERROR("Invalid argument for option %s: could not convert \"%s\" to %s", opt, arg, type_name);
ON_ERROR
  return -1;
}
