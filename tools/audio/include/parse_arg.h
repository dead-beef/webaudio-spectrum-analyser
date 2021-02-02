#ifndef PARSE_ARG_H_INCLUDED
#define PARSE_ARG_H_INCLUDED

typedef struct {
  const char *string;
  int value;
} enum_val_t;

int parse_fmt_arg(
  int argc,
  char **argv,
  int *i,
  void *val,
  const char *fmt,
  const char *type_name
);

int parse_fmt_args(
  int argc,
  char **argv,
  int *i,
  void **vals,
  int val_count,
  const char *fmt,
  const char *type_name
);

int parse_int_arg(int argc, char **argv, int *i, int *val);
int parse_int_args(int argc, char **argv, int *i, int **vals, int val_count);

int parse_float_arg(int argc, char **argv, int *i, float *val);
int parse_float_args(int argc, char **argv, int *i, float **vals, int val_count);

int parse_fft_size_arg(int argc, char **argv, int *i, int *val);

int parse_enum_arg(
  int argc,
  char **argv,
  int *i,
  int *val,
  const enum_val_t *values,
  const char *type_name
);

#endif
