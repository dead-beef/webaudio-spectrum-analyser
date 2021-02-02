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


typedef struct {
  const char *input;
  const char *output;
  int fft_size;
  int sample_rate;
  int overlap;
  float duration;
  int threshold;
  int gain;
} options_t;

typedef struct {
  options_t *options;
  FILE *input;
  int input_line;
  fftval_t *fft_buf;
  float *ifft_buf;
  float *peak_buf;
  char *peak_fmt;
  char *line;
  int line_size;
  int fft_size;
  int fft_buf_size;
  int peak_buf_size;
  int min_peaks;
  int max_peaks;
  int sample_rate;
  int is_fft_peaks;
  float threshold2;
  float gain;
  float bin_size;
  int frame;
} data_t;


int read_next_frame(data_t *data) {
  int start = 1;
  int end = 0;
  int i = 0;
  int ret = 0;
  int rc;

  memset(data->fft_buf, 0, data->fft_buf_size * sizeof(*data->fft_buf));
  //memset(data->ifft_buf, 0, data->fft_size * sizeof(*data->ifft_buf));

  while (1) {
    HANDLE_RC(rc = read_line(data->line, data->line_size, data->input, &data->input_line), NULL);
    if (rc) {
      if (end) {
        break;
      }
      if (!start) {
        ERROR("Unexpected end of file");
      }
      ret = 1;
      break;
    }
    if (is_empty_line(data->line)) {
      if (start) {
        continue;
      }
      if (end) {
        break;
      }
      ERROR("Unexpected end of frame at line #%d", data->input_line);
    }
    if (start) {
      start = 0;
    }
    if (end) {
      ERROR("Frame is too long (line #%d is not empty)", data->input_line);
    }

    if (data->is_fft_peaks) {
      HANDLE_RC(parse_float_array(data->line, data->peak_buf, data->max_peaks * 3, data->max_peaks * 3), "Could not parse line #%d", data->input_line);
      end = 1;
      for (int k = 0; k < data->peak_buf_size; k += 3) {
        float f = data->peak_buf[k];
        if (f > 1e-5) {
          int bin = round(f / data->bin_size - 0.5);
          float re = data->peak_buf[k + 1];
          float im = data->peak_buf[k + 2];
          //print_log("%f %d %f %f", f, bin, re, im);
          data->fft_buf[bin].r = re;
          data->fft_buf[bin].i = im;
        }
      }
    } else {
      float line[3];
      HANDLE_RC(parse_float_array(data->line, line, 3, 3), "Could not parse line #%d", data->input_line);
      data->fft_buf[i].r = line[1];
      data->fft_buf[i].i = line[2];
      if (++i >= data->fft_buf_size) {
        end = 1;
      }
    }
  }

  for (i = 0; i < data->fft_buf_size; ++i) {
    fftval_t *val = data->fft_buf + i;
    float mag2 = val->r * val->r + val->i * val->i;
    if (mag2 < data->threshold2) {
      val->r = 0.0;
      val->i = 0.0;
    } else {
      val->r *= data->gain;
      val->i *= data->gain;
    }
  }

  ifft(data->fft_buf, data->ifft_buf, data->fft_size);
  /*if (data->options->overlap) {
    ifft(data->fft_buf, data->ifft_buf, data->fft_size);
    int j;
    int center = data->fft_size / 2;
    for (j = 0; j < center; ++j) {
      data->ifft_buf[j] += data->ifft_buf[j + center];
    }
    for (; j < data->fft_size; ++j) {
      data->ifft_buf[j] = data->ifft_buf[j - center];
    }
  } else {
    ifft(data->fft_buf, data->ifft_buf, data->fft_size);
  }*/

  return ret;

ON_ERROR
  return -1;
}

int generate_frame(float *buf, int length, int sample_rate, void *data_) {
  data_t *data = data_;
  if (data->frame == 0) {
    int eof;
    HANDLE_RC(eof = read_next_frame(data), NULL);
    if (eof) {
      return 1;
    }
  }

  memmove(buf, data->ifft_buf, length * sizeof(*buf));
  ++data->frame;

  double time = (double)(data->frame) * length / sample_rate;
  //print_log("time %.2f", time);
  if (time > data->options->duration + 1) {
    data->frame = 0;
  }

  return 0;

ON_ERROR
  return -1;
}

void destroy_data(data_t *data) {
  FCLOSE(data->input);
  FREE(data->line);
  FREE(data->fft_buf);
  FREE(data->ifft_buf);
  FREE(data->peak_buf);
  FREE(data->peak_fmt);
}

int init_data(data_t *data) {
  enum { BUF_SIZE = 512 };
  char buf[BUF_SIZE];
  char type[32];

  HANDLE_NULL(data->input = fopen(data->options->input, "rt"), "Could not open input file \"%s\": %s", data->options->input, strerror(errno));

  data->input_line = 0;
  int rc;
  HANDLE_RC(rc = read_line(buf, BUF_SIZE, data->input, &data->input_line), NULL);
  if (rc) {
    ERROR("Unexpected end of file");
  }

  rc = sscanf(buf, " type = %31s", type);
  if (rc < 0) {
    ERROR("Could not read input file header: %s", strerror(errno));
  } else if (rc < 1) {
    ERROR("Invalid input file header: missing type: \"%s\"", buf);
  } else if (!strcmp(type, "fft")) {
    data->is_fft_peaks = 0;
    data->peak_fmt = NULL;
    data->peak_buf = NULL;
    data->peak_buf_size = 0;
    data->min_peaks = 0;
    data->max_peaks = 0;
    data->line_size = 512;
    rc = sscanf(
      buf,
      " %*s sample_rate = %d fft_size = %d ",
      &data->sample_rate,
      &data->fft_size
    );
    if (rc < 0) {
      ERROR("Could not read input file header: %s", strerror(errno));
    } else if (rc < 2) {
      ERROR("Invalid input file header: missing sample_rate or fft_size: \"%s\"", buf);
    }
  } else if (!strcmp(type, "fft_peaks")) {
    data->is_fft_peaks = 1;
    data->sample_rate = data->options->sample_rate;
    data->fft_size = data->options->fft_size;
    rc = sscanf(
      buf,
      " %*s min_peaks = %d max_peaks = %d ",
      &data->min_peaks,
      &data->max_peaks
    );
    if (rc < 0) {
      ERROR("Could not read input file header: %s", strerror(errno));
    } else if (rc < 2) {
      ERROR("Invalid input file header: missing min_peaks or max_peaks: \"%s\"", buf);
    }

    data->peak_buf_size = 3 * data->max_peaks;
    data->line_size = 20 * data->peak_buf_size;
    HANDLE_NULL(data->peak_buf = calloc(data->peak_buf_size, sizeof(*data->peak_buf)), "Could not allocate fft peak buffer");

    int peak_fmt_size = data->peak_buf_size * 3;
    HANDLE_NULL(data->peak_fmt = calloc(peak_fmt_size, sizeof(*data->peak_fmt)), "Could not allocate fft peak format buffer");
    int i = 0;
    while (i < peak_fmt_size) {
      data->peak_fmt[i++] = ' ';
      data->peak_fmt[i++] = '%';
      data->peak_fmt[i++] = 'f';
    }
  } else {
    ERROR("Invalid input file type: \"%s\"", buf);
  }

  data->bin_size = (float)data->sample_rate / data->fft_size;
  data->fft_buf_size = 1 + data->fft_size / 2;
  HANDLE_NULL(data->fft_buf = calloc(data->fft_buf_size, sizeof(*data->fft_buf)), "Could not allocate fft buffer");
  HANDLE_NULL(data->ifft_buf = calloc(data->fft_size, sizeof(*data->ifft_buf)), "Could not allocate inverse fft buffer");
  HANDLE_NULL(data->line = calloc(data->line_size, sizeof(*data->line)), "Could not allocate line buffer");

  data->threshold2 = pow(10.0, data->options->threshold / 5.0);
  data->gain = pow(10.0, data->options->gain / 10.0);

  return 0;
ON_ERROR
  destroy_data(data);
  return -1;
}


void print_usage(const char *name, const options_t *defaults) {
  fprintf(
    stderr,
    "usage: %s [-h] [-f FFT_SIZE] [-r SAMPLE_RATE] [-d DURATION] [-t THRESHOLD] [-g GAIN] [-o] [-no] [--] <input> <output>\n"
    "\n"
    "positional arguments:\n"
    "  input                     input fft file from process-audio\n"
    "  output                    output audio file\n"
    "\n"
    "optional arguments:\n"
    "  -h, --help                show this help message and exit\n"
    "  -f FFT_SIZE, --fft-size FFT_SIZE\n"
    "                            fft size if input file type=fft_peaks\n"
    "                            (default: %d)\n"
    "  -r SAMPLE_RATE, --sample-rate SAMPLE_RATE\n"
    "                            sample rate if input file type=fft_peaks\n"
    "                            (default: %d)\n"
    "  -d DURATION, --duration DURATION\n"
    "                            frame duration in seconds\n"
    "                            (default: %.2f)\n"
    "  -t THRESHOLD, --threshold THRESHOLD\n"
    "                            fft magnitude threshold in decibels\n"
    "                            (default: %d)\n"
    "  -g GAIN, --gain GAIN      gain in decibels\n"
    "                            (default: %d)\n"
    "  -o, --overlap             enable overlapping (default)\n"
    "  -no, --no-overlap         disable overlapping\n"
    "\n",
    name,
    defaults->fft_size,
    defaults->sample_rate,
    defaults->duration,
    defaults->threshold,
    defaults->gain
  );
}

int parse_args(int argc, char **argv, options_t *opts) {
  const options_t defaults = {
    .input = NULL,
    .output = NULL,
    .fft_size = 4096,
    .sample_rate = 44100,
    .duration = 4.0,
    .overlap = 1,
    .threshold = -100,
    .gain = 0.0
  };
  *opts = defaults;

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
    } else if (!strcmp(argv[i], "-r") || !strcmp(argv[i], "--sample-rate")) {
      HANDLE_RC(parse_int_arg(argc, argv, &i, &opts->sample_rate), NULL);
    } else if (!strcmp(argv[i], "-d") || !strcmp(argv[i], "--duration")) {
      HANDLE_RC(parse_float_arg(argc, argv, &i, &opts->duration), NULL);
    } else if (!strcmp(argv[i], "-t") || !strcmp(argv[i], "--threshold")) {
      HANDLE_RC(parse_int_arg(argc, argv, &i, &opts->threshold), NULL);
    } else if (!strcmp(argv[i], "-g") || !strcmp(argv[i], "--gain")) {
      HANDLE_RC(parse_int_arg(argc, argv, &i, &opts->gain), NULL);
    } else if (!strcmp(argv[i], "-o") || !strcmp(argv[i], "--overlap")) {
      opts->overlap = 1;
    } else if (!strcmp(argv[i], "-no") || !strcmp(argv[i], "--no-overlap")) {
      opts->overlap = 0;
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
  print_log("infile = %s; outfile = %s; type = %d; fft_size = %d; sample_rate = %d;", opts.input, opts.output, data.is_fft_peaks, data.fft_size, data.sample_rate);
  HANDLE_RC(encode_audio(opts.output, data.fft_size, data.sample_rate, generate_frame, &data), NULL);

  destroy_data(&data);
  return 0;

ON_ERROR
  destroy_data(&data);
  return 1;
}
