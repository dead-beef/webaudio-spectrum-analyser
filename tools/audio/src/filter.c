#include "util.h"
#include "error.h"
#include "log.h"
#include "parse_arg.h"
#include "codec.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <math.h>
#include <ctype.h>

#include <wasm/fft.h>
#include <wasm/filter.h>

typedef enum {
  FT_NONE,
  FT_REMOVE_HARMONICS,
  FT_ADD_HARMONICS
} filter_type_t;

typedef struct {
  const char *input;
  const char *output;
  int fft_size;
  filter_type_t type;
  int gain;
  float min_pitch;
  float max_pitch;
  int min_harmonic;
  int max_harmonic;
  int step;
  float f_scale_radius;
  float harmonic_search_radius;
  int smooth_scale;
} options_t;

typedef struct {
  options_t *options;
  fftval_t *fft_buf;
  float *input_buf;
  float *input_prev_buf;
  float *ifft_buf;
  float *ifft_prev_buf;
  int end_frames;
} data_t;

void do_filter_frame(float *input, int length, int sample_rate, data_t *data) {
  float *tmp = data->ifft_prev_buf;
  data->ifft_prev_buf = data->ifft_buf;
  data->ifft_buf = tmp;

  filter_start(input, data->fft_buf, length);
  switch (data->options->type) {
    case FT_NONE:
      break;
    case FT_REMOVE_HARMONICS:
      scale_harmonics(
        data->fft_buf,
        length,
        sample_rate,
        data->options->min_pitch,
        data->options->max_pitch,
        data->options->min_harmonic,
        data->options->max_harmonic,
        data->options->step,
        0.0,
        data->options->f_scale_radius,
        data->options->harmonic_search_radius,
        data->options->smooth_scale
      );
      break;
    case FT_ADD_HARMONICS:
      add_harmonics(
        data->fft_buf,
        length,
        sample_rate,
        data->options->min_pitch,
        data->options->max_pitch,
        data->options->min_harmonic,
        data->options->max_harmonic,
        data->options->step,
        data->options->f_scale_radius,
        data->options->harmonic_search_radius,
        data->options->smooth_scale
      );
      break;
    default:
      memset(data->fft_buf, 0, length * sizeof(*data->fft_buf));
  }
  if (data->options->gain) {
    gain(data->fft_buf, length, data->options->gain);
  }
  filter_end(data->ifft_buf, data->fft_buf, length);
}


int filter_frame(
  float *input,
  float *output,
  int length,
  int sample_rate,
  void *data_
) {
  data_t *data = data_;

  int ret = 0;
  int center = length / 2;

  if (!input) {
    ret = 1;
    input = data->input_buf;
    memmove(input, input + center, center * sizeof(*input));
    memset(input + center, 0, center * sizeof(*input));
    do_filter_frame(input, length, sample_rate, data);
    for (int i = 0; i < center; ++i) {
      output[i] = data->ifft_prev_buf[center + i] + data->ifft_buf[i];
    }
    for (int i = center; i < length; ++i) {
      output[i] = data->ifft_buf[i];
    }
  } else {
    float *tmp = data->input_prev_buf;
    data->input_prev_buf = data->input_buf;
    data->input_buf = tmp;
    memmove(data->input_buf, input, length * sizeof(*input));

    memmove(input + center, input, center * sizeof(*input));
    memmove(input, data->input_prev_buf + center, center * sizeof(*input));
    do_filter_frame(input, length, sample_rate, data);
    for (int i = 0; i < center; ++i) {
      output[i] = data->ifft_prev_buf[center + i] + data->ifft_buf[i];
    }

    memmove(input, data->input_buf, length * sizeof(*input));
    do_filter_frame(input, length, sample_rate, data);
    for (int i = center; i < length; ++i) {
      output[i] = data->ifft_prev_buf[i] + data->ifft_buf[i - center];
    }
  }

  return ret;
}

void destroy_data(data_t *data) {
  FREE(data->input_buf);
  FREE(data->input_prev_buf);
  FREE(data->fft_buf);
  FREE(data->ifft_buf);
  FREE(data->ifft_prev_buf);
}

int init_data(data_t *data) {
  int fft_size = data->options->fft_size;
  int fft_bins = 1 + fft_size / 2;
  HANDLE_NULL(data->input_buf = calloc(fft_size, sizeof(*data->input_buf)), "Could not allocate buffer");
  HANDLE_NULL(data->input_prev_buf = calloc(fft_size, sizeof(*data->input_prev_buf)), "Could not allocate buffer");
  HANDLE_NULL(data->fft_buf = calloc(fft_bins, sizeof(*data->fft_buf)), "Could not allocate fft buffer");
  HANDLE_NULL(data->ifft_buf = calloc(fft_size, sizeof(*data->ifft_buf)), "Could not allocate inverse fft buffer");
  HANDLE_NULL(data->ifft_prev_buf = calloc(fft_size, sizeof(*data->ifft_prev_buf)), "Could not allocate inverse fft buffer");
  return 0;
ON_ERROR
  destroy_data(data);
  return -1;
}


void print_usage(const char *name, const options_t *defaults) {
  fprintf(
    stderr,
    "usage: %s [-h] [-t {none,remove_harmonics,add_harmonics}] [-f FFT_SIZE] [-g GAIN] [-F MIN MAX] [-H MIN MAX STEP] [-r RADIUS] [-s SEARCH_RADIUS] [-S] [-nS] [--] <input> <output>\n"
    "\n"
    "positional arguments:\n"
    "  input                     input audio file\n"
    "  output                    output audio file\n"
    "\n"
    "optional arguments:\n"
    "  -h, --help                show this help message and exit\n"
    "  -f FFT_SIZE, --fft-size FFT_SIZE\n"
    "                            fft size\n"
    "                            (default: %d)\n"
    "  -t {none,remove_harmonics,add_harmonics},\n"
    "  --type {none,remove_harmonics,add_harmonics}\n"
    "                            filter type\n"
    "                            (default: none)\n"
    "  -g GAIN, --gain GAIN      gain in decibels\n"
    "                            (default: %d)\n"
    "  -F MIN MAX, --frequency MIN MAX\n"
    "                            fundamental frequency range\n"
    "                            (default: %.1f %.1f)\n"
    "  -H MIN MAX STEP, --harmonic MIN MAX STEP\n"
    "                            harmonic range\n"
    "                            (default: %d %d %d)\n"
    "  -r RADIUS, --radius RADIUS\n"
    "                            fft scale/copy radius in hertz\n"
    "                            (default: %.1f)\n"
    "  -s SEARCH_RADIUS, --search-radius SEARCH_RADIUS\n"
    "                            harmonic search radius in fractions of fundamental frequency\n"
    "                            (default: %.1f)\n"
    "  -S, --smooth              enable smooth fft scale/copy\n"
    "  -nS, --no-smooth          disable smooth fft scale/copy (default)\n"
    "\n",
    name,
    defaults->fft_size,
    defaults->gain,
    defaults->min_pitch,
    defaults->max_pitch,
    defaults->min_harmonic,
    defaults->max_harmonic,
    defaults->step,
    defaults->f_scale_radius,
    defaults->harmonic_search_radius
  );
}

int parse_args(int argc, char **argv, options_t *opts) {
  const options_t defaults = {
    .input = NULL,
    .output = NULL,
    .fft_size = 4096,
    .type = FT_NONE,
    .gain = 0,
    .min_pitch = 90,
    .max_pitch = 200,
    .min_harmonic = 1,
    .max_harmonic = 200,
    .step = 2,
    .f_scale_radius = 60,
    .harmonic_search_radius = 0.3,
    .smooth_scale = 0
  };
  *opts = defaults;

  const enum_val_t filter_type_values[] = {
    { "none", FT_NONE },
    { "remove_harmonics", FT_REMOVE_HARMONICS },
    { "add_harmonics", FT_ADD_HARMONICS },
    { NULL },
  };

  if (argc <= 1) {
    print_usage(argv[0], &defaults);
    exit(1);
  }

  int i;
  for (i = 1; i < argc; ++i) {
    if (!strcmp(argv[i], "--")) {
      ++i;
      break;
    }
    if (!strcmp(argv[i], "-h") || !strcmp(argv[i], "--help")) {
      print_usage(argv[0], &defaults);
      exit(1);
    }
    if (!strcmp(argv[i], "-f") || !strcmp(argv[i], "--fft-size")) {
      HANDLE_RC(parse_fft_size_arg(argc, argv, &i, &opts->fft_size), NULL);
    } else if (!strcmp(argv[i], "-t") || !strcmp(argv[i], "--type")) {
      int val;
      HANDLE_RC(parse_enum_arg(argc, argv, &i, &val, filter_type_values, "filter_type_t"), NULL);
      opts->type = val;
    } else if (!strcmp(argv[i], "-g") || !strcmp(argv[i], "--gain")) {
      HANDLE_RC(parse_int_arg(argc, argv, &i, &opts->gain), NULL);
    } else if (!strcmp(argv[i], "-F") || !strcmp(argv[i], "--frequency")) {
      float *vals[2] = { &opts->min_pitch, &opts->max_pitch };
      HANDLE_RC(parse_float_args(argc, argv, &i, vals, 2), NULL);
    } else if (!strcmp(argv[i], "-H") || !strcmp(argv[i], "--harmonic")) {
      int *vals[3] = { &opts->min_harmonic, &opts->max_harmonic, &opts->step };
      HANDLE_RC(parse_int_args(argc, argv, &i, vals, 3), NULL);
    } else if (!strcmp(argv[i], "-r") || !strcmp(argv[i], "--radius")) {
      HANDLE_RC(parse_float_arg(argc, argv, &i, &opts->f_scale_radius), NULL);
    } else if (!strcmp(argv[i], "-s") || !strcmp(argv[i], "--search-radius")) {
      HANDLE_RC(parse_float_arg(argc, argv, &i, &opts->harmonic_search_radius), NULL);
    } else if (!strcmp(argv[i], "-S") || !strcmp(argv[i], "--smooth")) {
      opts->smooth_scale = 1;
    } else if (!strcmp(argv[i], "-nS") || !strcmp(argv[i], "--no-smooth")) {
      opts->smooth_scale = 0;
    } else if(argv[i][0] == '-') {
      ERROR("Invalid option: %s", argv[i]);
    } else {
      break;
    }
  }

  if (i >= argc) {
    ERROR("Missing input file argument");
  }
  opts->input = argv[i++];

  if (i >= argc) {
    ERROR("Missing output file argument");
  }
  opts->output = argv[i++];

  if (i < argc) {
    ERROR("Unexpected argument: %s", argv[i]);
  }

  return 0;

ON_ERROR
  return -1;
}

int main(int argc, char **argv)
{
  options_t opts;
  data_t data = { .options = &opts };

  HANDLE_RC(parse_args(argc, argv, &opts), NULL);
  HANDLE_RC(init_data(&data), NULL);

  HANDLE_RC(filter_audio(opts.input, opts.output, opts.fft_size, filter_frame, &data), NULL);

  destroy_data(&data);
  return 0;

ON_ERROR
  destroy_data(&data);
  return 1;
}
