#include "util.h"
#include "error.h"
#include "log.h"
#include "codec.h"
#include "parse_arg.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <math.h>

#include <wasm/fft.h>
#include <wasm/prominence.h>

typedef enum {
  OT_NONE,
  OT_PCM,
  OT_FFT,
  OT_FFT_PEAKS
} output_type_t;

typedef struct {
  const char *input;
  output_type_t output_type;
  int fft_size;
  float fft_smoothing;
  float interval;
  int interval_seconds;
  int min_peaks;
  int max_peaks;
  float min_frequency;
  float max_frequency;
  float min_prominence;
} options_t;

typedef struct {
  options_t *options;
  fftval_t *fft_buf;
  fftval_t *smooth_fft_buf;
  fftmag_t *fft_mag_buf;
  fftmag_t *prominence_buf;
  int *peak_buf;
  float bin_size;
  int bins;
  int init;
  int sample_rate;
  int frame;
  int interval;
  int min_peak_index;
  int max_peak_index;
} data_t;


int init_data(data_t *data, int sample_rate, int fft_size) {
  data->init = 0;
  data->sample_rate = sample_rate;
  data->bins = 1 + fft_size / 2;
  data->bin_size = (float)sample_rate / fft_size;
  data->frame = 0;
  if (data->options->interval_seconds) {
    data->interval = round(data->options->interval * data->bin_size);
  } else {
    data->interval = round(data->options->interval);
  }
  data->min_peak_index = round(data->options->min_frequency / data->bin_size);
  data->max_peak_index = round(data->options->max_frequency / data->bin_size);

  if (data->options->output_type == OT_FFT
      || data->options->output_type == OT_FFT_PEAKS) {
    HANDLE_NULL(data->fft_buf = calloc(data->bins, sizeof(*data->fft_buf)), "Could not allocate fft buffer");
    HANDLE_NULL(data->smooth_fft_buf = calloc(data->bins, sizeof(*data->smooth_fft_buf)), "Could not allocate fft buffer");
  } else {
    data->fft_buf = NULL;
    data->smooth_fft_buf = NULL;
  }

  if (data->options->output_type == OT_FFT_PEAKS) {
    HANDLE_NULL(data->fft_mag_buf = calloc(data->bins, sizeof(*data->fft_mag_buf)), "Could not allocate fft magnitude buffer");
    HANDLE_NULL(data->prominence_buf = calloc(data->bins, sizeof(*data->prominence_buf)), "Could not allocate prominence buffer");
    HANDLE_NULL(data->peak_buf = calloc(data->options->max_peaks, sizeof(*data->peak_buf)), "Could not allocate fft peak index buffer");
  } else {
    data->fft_mag_buf = NULL;
    data->prominence_buf = NULL;
    data->peak_buf = NULL;
  }

  return 0;

ON_ERROR
  return -1;
}

void free_data(data_t *data) {
  FREE(data->fft_buf);
  FREE(data->smooth_fft_buf);
  FREE(data->fft_mag_buf);
  FREE(data->prominence_buf);
  FREE(data->peak_buf);
}


int noop(
  float *frame __attribute__((unused)),
  int size __attribute__((unused)),
  int sample_rate __attribute__((unused)),
  void *data __attribute__((unused))
) {
  return 0;
}

int print_frame(float *frame, int size, int sample_rate, void *data) {
  data_t *d = (data_t*)data;
  if (d->init) {
    d->sample_rate = sample_rate;
    d->init = 0;
  }
  fwrite(frame, sizeof(*frame), size, stdout);
  return 0;
}

void print_fft_header(data_t *data) {
  if (data->options->output_type == OT_FFT_PEAKS) {
    fprintf(
      stdout,
      "type=fft_peaks min_peaks=%d max_peaks=%d\n\n",
      data->options->min_peaks,
      data->options->max_peaks
    );
  } else {
    fprintf(
      stdout,
      "type=fft sample_rate=%d fft_size=%d\n\n",
      data->sample_rate,
      data->options->fft_size
    );
  }
}

void print_fft_values(fftval_t *fft_buf, data_t *data) {
  for (int i = 0; i < data->bins; ++i) {
    float frequency = data->bin_size * i;
    fprintf(
      stdout,
      "%7.1f %13.10f %13.10f\n",
      frequency,
      fft_buf[i].r,
      fft_buf[i].i
    );
  }
  fputc('\n', stdout);
}

void print_fft_magnitudes(fftmag_t *fft_mag_buf, data_t *data) {
  for (int i = 0; i < data->bins; ++i) {
    float frequency = data->bin_size * i;
    fprintf(stdout, "%7.1f %7.2f\n", frequency, fft_mag_buf[i]);
  }
  fputc('\n', stdout);
}

void print_fft_peaks(fftval_t *fft_buf, data_t *data) {
  const fftmag_t MIN_DB = -100;
  const fftmag_t MAX_DB = 0;
  const fftmag_t DB_REF = 1;

  fftmag_t *fft_mag_buf = data->fft_mag_buf;
  fftmag_t *prominence_buf = data->prominence_buf;

  magnitude(fft_buf, fft_mag_buf, data->bins);
  magnitude_to_decibels(
    fft_mag_buf,
    fft_mag_buf,
    data->bins,
    DB_REF,
    MIN_DB,
    MAX_DB
  );
  prominence(
    fft_mag_buf,
    prominence_buf,
    data->bins,
    data->min_peak_index,
    data->max_peak_index + 1,
    -1,
    MIN_DB,
    MAX_DB,
    TRUE
  );

  int peaks = 0;
  int *peak_buf = data->peak_buf;
  int peak_buf_size = data->options->max_peaks;
  memset(peak_buf, 0, peak_buf_size * sizeof(*peak_buf));

  int start = clamp(data->min_peak_index, 0, data->bins - 1);
  int end = clamp(data->max_peak_index, 0, data->bins - 1);
  float threshold = data->options->min_prominence;

  for (int i = start; i <= end && peaks < peak_buf_size; ++i) {
    if (prominence_buf[i] > threshold) {
      peak_buf[peaks++] = i;
    }
  }

  const char *FMT = "  %7.1f %13.10f %13.10f";
  if (peaks >= data->options->min_peaks) {
    int i;
    for (i = 0; i < peaks; ++i) {
      int j = peak_buf[i];
      fftval_t peak;
      float offset = interpolate_peak(
        fft_buf,
        fft_mag_buf,
        data->bins,
        j,
        &peak
      );
      //print_log("%f %f %f %f %f", j * data->bin_size, fft_mag_buf[j - 1], fft_mag_buf[j], fft_mag_buf[j + 1], offset);
      float frequency = data->bin_size * (j + offset);
      fprintf(stdout, FMT, frequency, peak.r, peak.i);
    }
    for (; i < peak_buf_size; ++i) {
      fprintf(stdout, FMT, 0.0f, 0.0f, 0.0f);
    }
    fprintf(stdout, "\n\n");
  }
}

void print_fft(data_t *data) {
  switch (data->options->output_type) {
    case OT_FFT:
      print_fft_values(data->smooth_fft_buf, data);
      break;
    case OT_FFT_PEAKS:
      print_fft_peaks(data->smooth_fft_buf, data);
      break;
    default:
      break;
  }
}

int fft_frame(float *frame, int size, int sample_rate, void *data) {
  data_t *d = (data_t*)data;
  if (d->init) {
    HANDLE_RC(init_data(d, sample_rate, size), NULL);
    print_fft_header(d);
  }

  normalize(frame, frame, size);
  window(frame, frame, size);
  fft(frame, d->fft_buf, size);
  smooth_fft(d->fft_buf, d->smooth_fft_buf, d->bins, d->options->fft_smoothing);

  ++d->frame;
  if (d->interval >= 0 && d->frame > d->interval) {
    d->frame = 0;
    print_fft(d);
    //memset(smooth_fft_buf, 0, d->bins * sizeof(*smooth_fft_buf));
  }

  return 0;

ON_ERROR
  return -1;
}

void print_usage(const char *name, const options_t *defaults) {
  fprintf(
    stderr,
    "usage: %s [-h] [-t {none,pcm,fft,fft_peaks}] [-f SIZE] [-s SMOOTHING] [-i INTERVAL] [-p MIN MAX] [-P PROMINENCE] [-F MIN MAX] [--] <file>\n"
    "\n"
    "positional arguments:\n"
    "  file                      audio file to process\n"
    "\n"
    "optional arguments:\n"
    "  -h, --help                show this help message and exit\n"
    "  -t {none,pcm,fft,fft_peaks},\n"
    "  --type {none,pcm,fft,fft_peaks}\n"
    "                            output type\n"
    "                            none - no output\n"
    "                            pcm - output filtered audio (pcm 32-bit floating-point little-endian, mono)\n"
    "                            fft - print fft data\n"
    "                            fft_peaks - print fft peak frequencies and values\n"
    "                            (default: none)\n"
    "  -f SIZE, --fft-size SIZE  fft size (default: %d)\n"
    "  -s SMOOTHING, --fft-smoothing SMOOTHING\n"
    "                            fft smoothing factor (default: %.2f)\n"
    "  -i INTERVAL, --interval INTERVAL\n"
    "                            interval between processing smoothed fft\n"
    "                            <n> - process every <n> iterations\n"
    "                            <n>s - process every <n> seconds\n"
    "                            <n | n < 0> - process after end of file\n"
    "                            (default: -1)\n"
    "  -p MIN MAX, --peaks MIN MAX\n"
    "                            minimum and maximum numbers of fft peaks to output\n"
    "                            (default: %d %d)\n"
    "  -P PROMINENCE, --prominence PROMINENCE\n"
    "                            minimum fft peak prominence in decibels\n"
    "                            (default: %.1f)\n"
    "  -F MIN MAX, --frequency MIN MAX\n"
    "                            minimum and maximum frequencies of fft peaks\n"
    "                            (default: %.1f %.1f)\n"
    "\n",
    name,
    defaults->fft_size,
    defaults->fft_smoothing,
    defaults->min_peaks,
    defaults->max_peaks,
    defaults->min_prominence,
    defaults->min_frequency,
    defaults->max_frequency
  );
}

int parse_args(int argc, char **argv, options_t *opts) {
  const options_t defaults = {
    .input = NULL,
    .output_type = OT_NONE,
    .fft_size = 4096,
    .fft_smoothing = 0.9,
    .interval = -1,
    .interval_seconds = 0,
    .min_peaks = 1,
    .max_peaks = 4,
    .min_frequency = 20.0,
    .max_frequency = 20000.0,
    .min_prominence = 20.0
  };
  *opts = defaults;

  const enum_val_t output_type_values[] = {
    { "none", OT_NONE },
    { "pcm", OT_PCM },
    { "fft", OT_FFT },
    { "fft_peaks", OT_FFT_PEAKS },
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
    } else if (!strcmp(argv[i], "-s") || !strcmp(argv[i], "--smoothing")) {
      HANDLE_RC(parse_float_arg(argc, argv, &i, &opts->fft_smoothing), NULL);
    } else if (!strcmp(argv[i], "-t") || !strcmp(argv[i], "--type")) {
      int val;
      HANDLE_RC(parse_enum_arg(argc, argv, &i, &val, output_type_values, "output_type_t"), NULL);
      opts->output_type = val;
    } else if (!strcmp(argv[i], "-P") || !strcmp(argv[i], "--prominence")) {
      HANDLE_RC(parse_float_arg(argc, argv, &i, &opts->min_prominence), NULL);
    } else if (!strcmp(argv[i], "-p") || !strcmp(argv[i], "--peaks")) {
      int *vals[2] = { &opts->min_peaks, &opts->max_peaks };
      HANDLE_RC(parse_int_args(argc, argv, &i, vals, 2), NULL);
    } else if (!strcmp(argv[i], "-F") || !strcmp(argv[i], "--frequency")) {
      float *vals[2] = { &opts->min_frequency, &opts->max_frequency };
      HANDLE_RC(parse_float_args(argc, argv, &i, vals, 2), NULL);
    } else if (!strcmp(argv[i], "-i") || !strcmp(argv[i], "--interval")) {
      if (i + 1 >= argc) {
        ERROR("Option %s requires an argument", argv[i]);
      }
      ++i;
      float val;
      char unit;
      int rc = sscanf(argv[i], "%f%c", &val, &unit);
      const char *err = NULL;
      if (rc < 0) {
        err = strerror(errno);
      } else if (rc < 1) {
        err = "not a number";
      } else if (rc == 1) {
        unit = 'f';
      } else if (unit != 's') {
        err = "invalid unit";
      }
      if (err != NULL) {
        ERROR("Invalid interval: %s: %s", argv[i], err);
      }
      opts->interval = val;
      opts->interval_seconds = (unit == 's');
    } else if(argv[i][0] == '-') {
      ERROR("Invalid option: %s", argv[i]);
    } else {
      break;
    }
  }

  if (i >= argc) {
    ERROR("Missing file argument");
  }
  opts->input = argv[i];
  ++i;

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
  HANDLE_RC(parse_args(argc, argv, &opts), NULL);

  process_frame_t process_frame = NULL;
  data_t process_frame_data = {
    .init = 1,
    .options = &opts,
  };

  switch(opts.output_type) {
    case OT_NONE:
      process_frame = noop;
      break;
    case OT_PCM:
      process_frame = print_frame;
      break;
    case OT_FFT:
    case OT_FFT_PEAKS:
      process_frame = fft_frame;
      break;
    default:
      ERROR("Output type %d is not implemented", (int)opts.output_type);
  }

  HANDLE_RC(decode_audio(opts.input, opts.fft_size, process_frame, &process_frame_data, FALSE), NULL);

  if (opts.output_type == OT_PCM) {
    print_log("\nffplay -f f32le -ac 1 -ar %d", process_frame_data.sample_rate);
  } else if (process_frame_data.frame || opts.interval < 0) {
    print_fft(&process_frame_data);
  }

  free_data(&process_frame_data);
  return 0;

ON_ERROR
  free_data(&process_frame_data);
  return 1;
}
