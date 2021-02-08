#ifndef UTIL_H_INCLUDED
#define UTIL_H_INCLUDED

#include <stdio.h>

#define FREE(p) if (p) { free(p); (p) = NULL; }
#define FCLOSE(fp) if (fp) { fclose(fp); (fp) = NULL; }

int is_empty_line(char *s);

int read_line(char *buf, int size, FILE *fp, int *line_number);

int parse_fmt(
  const char *str,
  void *res,
  const char *fmt,
  const char *type_name
);

int parse_fmt_array(
  char *str,
  void *res,
  int min_length,
  int max_length,
  int element_size,
  const char *fmt,
  const char *type_name
);

int parse_int(const char *str, int *res);

int parse_float(const char *str, int *res);

int parse_float_array(
  char *str,
  float *res,
  int min_length,
  int max_length
);

#endif
