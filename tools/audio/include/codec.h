#ifndef CODEC_H_INCLUDED
#define CODEC_H_INCLUDED

typedef int (*process_frame_t)(float *buf, int length, int sample_rate, void *data);

typedef int (*filter_frame_t)(float *input, float *output, int length, int sample_rate, void *data);

int decode_audio(
  const char *fname,
  int frame_size,
  process_frame_t process_frame,
  void *process_frame_data,
  int process_incomplete_frame
);

int encode_audio(
  const char *fname,
  int generated_frame_size,
  int sample_rate,
  process_frame_t generate_frame,
  void *generate_frame_data
);

int filter_audio(
  const char *input_fname,
  const char *output_fname,
  int frame_size,
  filter_frame_t filter_frame,
  void *filter_frame_data
);

#endif
