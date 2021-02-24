#include "error.h"

#include <stdio.h>
#include <stddef.h>
#include <stdarg.h>

__thread const char *error_func = NULL;
__thread const char *error_file = NULL;
__thread int error_line = 0;

void set_traceback(const char *func, const char *file, int line) {
  error_func = func;
  error_file = file;
  error_line = line;
}

void unset_traceback() {
  error_func = NULL;
  error_file = NULL;
  error_line = 0;
}

void print_traceback() {
  fprintf(stderr, "  %s (%s:%d)\n", error_func, error_file, error_line);
}

void print_error(const char *format, ...) {
  if (format == NULL) {
    return;
  }
  fputs("Error: ", stderr);
  va_list args;
  va_start(args, format);
  vfprintf(stderr, format, args);
  va_end(args);
  fputc('\n', stderr);
}
