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
  float *ifft_prev_buf;
  float *peak_buf;
  char *line;
  int line_size;
  int fft_size;
  int frame_size;
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
  int first_frame;
  int last_frame;
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
      HANDLE_RC(parse_float_array(data->line, data->peak_buf, data->max_peaks * 2, data->max_peaks * 2), "Could not parse line #%d", data->input_line);
      end = 1;
      for (int k = 0; k < data->peak_buf_size; k += 2) {
        float f = data->peak_buf[k];
        if (f > 1e-5) {
          float bin_f = f / data->bin_size - 0.5;
          int bin = floor(bin_f);
          //int bin2 = ceil(bin_f);
          float db = data->peak_buf[k + 1];
          float re = pow(10.0, db / 10.0);
          float im = 0;
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

  return ret;

ON_ERROR
  return -1;
}

int generate_frame(float *buf, int length, int sample_rate, void *data_) {
  data_t *data = data_;
  if (data->frame == 0) {
    int eof;
    if (data->ifft_prev_buf) {
      memmove(
        data->ifft_prev_buf,
        data->ifft_buf,
        data->fft_size * sizeof(*data->ifft_buf)
      );
    }
    HANDLE_RC(eof = read_next_frame(data), NULL);
    if (eof) {
      if (!data->is_fft_peaks && !data->last_frame) {
        data->last_frame = 1;
        memmove(buf, data->ifft_buf + length, length * sizeof(*buf));
        return 0;
      }
      return 1;
    }
  }

  if (data->is_fft_peaks) {
    memmove(buf, data->ifft_buf, length * sizeof(*buf));
  } else if (!data->first_frame) {
    data->first_frame = 1;
    memmove(buf, data->ifft_buf, length * sizeof(*buf));
  } else {
    for (int i = 0; i < length; ++i) {
      buf[i] = data->ifft_buf[i] + data->ifft_prev_buf[length + i];
    }
  }
  ++data->frame;

  double time = (double)(data->frame) * length / sample_rate;
  //print_log("time %.2f", time);
  if (time > data->options->duration) {
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
  FREE(data->ifft_prev_buf);
  FREE(data->peak_buf);
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
    data->frame_size = data->fft_size / 2;
  } else if (!strcmp(type, "fft_peaks")) {
    data->is_fft_peaks = 1;
    data->sample_rate = data->options->sample_rate;
    data->fft_size = data->options->fft_size;
    data->frame_size = data->fft_size;
    data->ifft_prev_buf = NULL;
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

    data->peak_buf_size = 2 * data->max_peaks;
    data->line_size = 20 * data->peak_buf_size;
  } else {
    ERROR("Invalid input file type: \"%s\"", buf);
  }

  data->frame = 0;
  data->first_frame = 0;
  data->last_frame = 0;
  data->bin_size = (float)data->sample_rate / data->fft_size;
  data->fft_buf_size = 1 + data->fft_size / 2;
  HANDLE_NULL(data->fft_buf = calloc(data->fft_buf_size, sizeof(*data->fft_buf)), "Could not allocate fft buffer");
  HANDLE_NULL(data->ifft_buf = calloc(data->fft_size, sizeof(*data->ifft_buf)), "Could not allocate inverse fft buffer");
  HANDLE_NULL(data->line = calloc(data->line_size, sizeof(*data->line)), "Could not allocate line buffer");
  if (!data->is_fft_peaks) {
    HANDLE_NULL(data->ifft_prev_buf = calloc(data->fft_size, sizeof(*data->ifft_prev_buf)), "Could not allocate inverse fft buffer");
    data->peak_buf = NULL;
  } else {
    HANDLE_NULL(data->peak_buf = calloc(data->peak_buf_size, sizeof(*data->peak_buf)), "Could not allocate fft peak buffer");
    data->ifft_prev_buf = NULL;
  }

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
    .duration = 0.0,
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
  HANDLE_RC(encode_audio(opts.output, data.frame_size, data.sample_rate, generate_frame, &data), NULL);

  destroy_data(&data);
  return 0;

ON_ERROR
  destroy_data(&data);
  return 1;
}
