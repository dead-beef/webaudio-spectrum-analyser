#ifndef ERROR_H_INCLUDED
#define ERROR_H_INCLUDED

#include <stdio.h>

#define ERROR(format, ...) { print_error(format __VA_OPT__(,) __VA_ARGS__); set_traceback(__func__, __FILE__, __LINE__); goto error; }
#define ON_ERROR error: print_traceback();

#define HANDLE_RC(rc, format, ...) if((rc) < 0) ERROR(format __VA_OPT__(,) __VA_ARGS__);
#define HANDLE_NULL(ptr, format, ...) if(!(ptr)) ERROR(format __VA_OPT__(,) __VA_ARGS__);
#define HANDLE_ERRNO(rc, format, ...) if((rc) < 0) ERROR(format __VA_OPT__(,) __VA_ARGS__, strerror(errno));
#define HANDLE_AV_ERROR(rc, format, ...) { int _rc = (rc); if(_rc < 0) ERROR(format __VA_OPT__(,) __VA_ARGS__, av_err2str(_rc)); }

extern const char *error_func;
extern const char *error_file;
extern int error_line;

void print_error(const char *format, ...);

void set_traceback(const char *func, const char *file, int line);
void unset_traceback();
void print_traceback();

#endif
