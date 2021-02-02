#include "error.h"
#include "log.h"
#include "parse_arg.h"
#include "codec.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <math.h>

#include <wasm/fft.h>

typedef enum {
  WT_SINE,
  WT_TRIANGLE,
  WT_SAWTOOTH,
  WT_SQUARE
} wave_type_t;

typedef double (*wave_func_t)(double frequency, double time);

typedef struct {
  const char *output;
  wave_type_t wave_type;
  int frame_size;
  int sample_rate;
  float duration;
  float frequency;
} options_t;

typedef struct {
  options_t *options;
  wave_func_t wave_func;
  int frame;
} data_t;


double sine_wave(double f, double t) {
  return sin(2.0 * M_PI * f * t);
}

double square_wave(double f, double t) {
  return copysign(1.0, sine_wave(f, t));
}

double sawtooth_wave(double f, double t) {
  double ft = f * t;
  return 2.0 * (ft - floor(ft)) - 1.0;
}

double triangle_wave(double f, double t) {
  return 2.0 / M_PI * asin(sine_wave(f, t));
}


int generate_frame(float *buf, int length, int sample_rate, void *data_) {
  data_t *data = data_;
  double time = (double)(data->frame) * length / sample_rate;
  //print_log("time %.2f", time);
  if (time > data->options->duration + 1) {
    return 1;
  }
  for (int i = 0; i < length; ++i) {
    double t = (double)i / sample_rate;
    buf[i] = data->wave_func(data->options->frequency, t + time);
  }
  ++data->frame;
  return 0;
}


void print_usage(const char *name, const options_t *defaults) {
  fprintf(
    stderr,
    "usage: %s [-h] [-t {sine,square,triangle,sawtooth}] [-f FREQUENCY] [-r SAMPLE_RATE] [-d DURATION] [--] <file>\n"
    "\n"
    "positional arguments:\n"
    "  file                      output audio file\n"
    "\n"
    "optional arguments:\n"
    "  -h, --help                show this help message and exit\n"
    "  -t {sine,square,triangle,sawtooth},\n"
    "  --type {sine,square,triangle,sawtooth}\n"
    "                            wave type\n"
    "                            (default: sine)\n"
    "  -f FREQUENCY, --frequency FREQUENCY\n"
    "                            wave frequency in hertz (default: %.1f)\n"
    "  -r SAMPLE_RATE, --sample-rate SAMPLE_RATE\n"
    "                            sample rate (default: %d)\n"
    "  -d DURATION, --duration DURATION\n"
    "                            duration in seconds (default: %.2f)\n"
    "\n",
    name,
    defaults->frequency,
    defaults->sample_rate,
    defaults->duration
  );
}

int parse_args(int argc, char **argv, options_t *opts) {
  const options_t defaults = {
    .output = NULL,
    .wave_type = WT_SINE,
    .frame_size = 4096,
    .sample_rate = 44100,
    .duration = 4.0,
    .frequency = 440.0
  };
  *opts = defaults;

  const enum_val_t wave_type_values[] = {
    { "sine", WT_SINE },
    { "square", WT_SQUARE },
    { "sawtooth", WT_SAWTOOTH },
    { "triangle", WT_TRIANGLE },
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
    if (!strcmp(argv[i], "-f") || !strcmp(argv[i], "--frequency")) {
      HANDLE_RC(parse_float_arg(argc, argv, &i, &opts->frequency), NULL);
    } else if (!strcmp(argv[i], "-r") || !strcmp(argv[i], "--sample-rate")) {
      HANDLE_RC(parse_int_arg(argc, argv, &i, &opts->sample_rate), NULL);
    } else if (!strcmp(argv[i], "-d") || !strcmp(argv[i], "--duration")) {
      HANDLE_RC(parse_float_arg(argc, argv, &i, &opts->duration), NULL);
    } else if (!strcmp(argv[i], "-t") || !strcmp(argv[i], "--type")) {
      int val;
      HANDLE_RC(parse_enum_arg(argc, argv, &i, &val, wave_type_values, "wave_type_t"), NULL);
      opts->wave_type = val;
    } else if(argv[i][0] == '-') {
      ERROR("Invalid option: %s", argv[i]);
    } else {
      break;
    }
  }

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
  switch (opts.wave_type) {
    case WT_SINE:
      data.wave_func = sine_wave;
      break;
    case WT_SQUARE:
      data.wave_func = square_wave;
      break;
    case WT_SAWTOOTH:
      data.wave_func = sawtooth_wave;
      break;
    case WT_TRIANGLE:
      data.wave_func = triangle_wave;
      break;
    default:
      ERROR("Wave type %d is not implemented", opts.wave_type);
  }
  HANDLE_RC(encode_audio(opts.output, opts.frame_size, opts.sample_rate, generate_frame, &data), NULL);
  return 0;

ON_ERROR
  return 1;
}
