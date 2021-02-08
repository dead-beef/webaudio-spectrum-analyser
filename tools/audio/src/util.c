#include "util.h"
#include "error.h"

#include <ctype.h>
#include <string.h>
#include <errno.h>


int is_empty_line(char *s) {
  while (*s && isspace(*s++));
  return !*s;
}

int read_line(char *buf, int size, FILE *fp, int *line_number) {
  ++*line_number;
  char *res = fgets(buf, size, fp);
  if (!res) {
    if (feof(fp)) {
      return 1;
    }
    ERROR("Could not read line #%d: %s", *line_number, strerror(errno));
  }
  if ((int)strlen(buf) == size - 1 && buf[size - 2] != '\n' && !feof(fp)) {
    ERROR("Line #%d is too long (max length = %d)", *line_number, size - 2);
  }
  return 0;
ON_ERROR
  return -1;
}


int parse_fmt(
  const char *str,
  void *res,
  const char *fmt,
  const char *type_name
) {
  char c;
  int rc = sscanf(str, fmt, res, &c);
  if (rc < 0) {
    ERROR("Could not parse \"%s\": %s", str, strerror(errno));
  } else if (rc != 1) {
    ERROR("Could not convert \"%s\" to %s", str, type_name);
  }
  return 0;
ON_ERROR
  return -1;
}

int parse_fmt_array(
  char *str,
  void *res,
  int min_length,
  int max_length,
  int element_size,
  const char *fmt,
  const char *type_name
) {
  char *saveptr = NULL;
  const char *delim = " \t\n";
  char *el = strtok_r(str, delim, &saveptr);
  int length = 0;
  while (el && length < max_length) {
    char *res_ = (char*)res + length * element_size;
    HANDLE_RC(parse_fmt(el, res_, fmt, type_name), "Could not parse element #%d", length);
    ++length;
    el = strtok_r(NULL, delim, &saveptr);
  }
  if (el && length == max_length) {
    ++length;
  }
  if (length < min_length || length > max_length) {
    ERROR("Expected %d - %d elements of type \"%s\", got %d", min_length, max_length, type_name, length);
  }
  return length;

ON_ERROR
  return -1;
}

int parse_int(const char *str, int *res) {
  return parse_fmt(str, res, "%d%c", "int");
}

int parse_float(const char *str, int *res) {
  return parse_fmt(str, res, "%f%c", "float");
}

int parse_float_array(
  char *str,
  float *res,
  int min_length,
  int max_length
) {
  return parse_fmt_array(
    str,
    res,
    min_length,
    max_length,
    sizeof(*res),
    "%f%c",
    "float"
  );
}
