#include "codec.h"
#include "error.h"
#include "log.h"

#include <stdlib.h>
#include <string.h>

#include <libavcodec/avcodec.h>
#include <libavformat/avformat.h>
#include <libavformat/avio.h>
#include <libavutil/file.h>
#include <libavfilter/buffersink.h>
#include <libavfilter/buffersrc.h>
#include <libavutil/opt.h>


#define _S(x) #x
#define S(x) _S(x)
#define RESAMPLE_RATE 44100


static int find_audio_stream(
  const char *fname,
  AVFormatContext **ctx,
  AVCodecContext **cctx
) {
  HANDLE_AV_ERROR(avformat_open_input(ctx, fname, NULL, NULL), "Could not open file \"%s\": %s", fname);
  HANDLE_AV_ERROR(avformat_find_stream_info(*ctx, NULL), "Could not find stream information in \"%s\": %s", fname);

  av_dump_format(*ctx, 0, fname, 0);

  int stream;
  AVCodec *codec = NULL;
  HANDLE_AV_ERROR(stream = av_find_best_stream(*ctx, AVMEDIA_TYPE_AUDIO, -1, -1, &codec, 0), "Could not find audio stream in \"%s\": %s", fname);

  AVCodecParameters *params = (*ctx)->streams[stream]->codecpar;
  HANDLE_NULL(*cctx = avcodec_alloc_context3(codec), "Could not allocate codec context");
  HANDLE_AV_ERROR(avcodec_parameters_to_context(*cctx, params), "Could not set codec parameters: %s");
  HANDLE_AV_ERROR(avcodec_open2(*cctx, NULL, NULL), "Could not open codec context: %s");

  return stream;

ON_ERROR
  return -1;
}

static int create_filter_graph(
  AVFormatContext *fctx,
  AVCodecContext *ctx,
  int stream,
  AVFilterGraph **graph,
  AVFilterContext **bufsrc_ctx,
  AVFilterContext **bufsink_ctx
) {
  AVFilterInOut *outputs = NULL;
  AVFilterInOut *inputs = NULL;
  const AVFilter *abuffersrc = NULL;
  const AVFilter *abuffersink = NULL;

  const int BUF_SIZE = 512;
  char buf[BUF_SIZE];
  const char *filter_desc = "aformat=sample_fmts=flt:channel_layouts=mono, aresample=" S(RESAMPLE_RATE);
  const enum AVSampleFormat out_sample_fmts[] = { AV_SAMPLE_FMT_FLT, -1 };
  const int64_t out_channel_layouts[] = { AV_CH_LAYOUT_MONO, -1 };
  const int out_sample_rates[] = { RESAMPLE_RATE, -1 };

  AVRational time_base = fctx->streams[stream]->time_base;
  const char *sample_fmt_name = NULL;

  if (!ctx->channel_layout) {
    ctx->channel_layout = av_get_default_channel_layout(ctx->channels);
  }
  HANDLE_NULL(sample_fmt_name = av_get_sample_fmt_name(ctx->sample_fmt), "Could not get sample format name");
  snprintf(
    buf,
    BUF_SIZE,
    "time_base=%d/%d:sample_rate=%d:sample_fmt=%s:channel_layout=0x%"PRIx64,
    time_base.num,
    time_base.den,
    ctx->sample_rate,
    sample_fmt_name,
    ctx->channel_layout
  );

  HANDLE_NULL(abuffersrc = avfilter_get_by_name("abuffer"), "Could not get abuffer filter");
  HANDLE_NULL(abuffersink = avfilter_get_by_name("abuffersink"), "Could not get abuffersink filter");
  HANDLE_NULL(inputs = avfilter_inout_alloc(), "Could not allocate filter");
  HANDLE_NULL(outputs = avfilter_inout_alloc(), "Could not allocate filter");
  HANDLE_NULL(*graph = avfilter_graph_alloc(), "Could not allocate filter graph");

  HANDLE_AV_ERROR(avfilter_graph_create_filter(bufsrc_ctx, abuffersrc, "in", buf, NULL, *graph), "Could not create input filter: %s");
  HANDLE_AV_ERROR(avfilter_graph_create_filter(bufsink_ctx, abuffersink, "out", NULL, NULL, *graph), "Could not create output filter: %s");

  HANDLE_AV_ERROR(av_opt_set_int_list(*bufsink_ctx, "sample_fmts", out_sample_fmts, -1, AV_OPT_SEARCH_CHILDREN), "Could not set output sample format: %s");
  HANDLE_AV_ERROR(av_opt_set_int_list(*bufsink_ctx, "channel_layouts", out_channel_layouts, -1, AV_OPT_SEARCH_CHILDREN), "Could not set output channel layout: %s");
  HANDLE_AV_ERROR(av_opt_set_int_list(*bufsink_ctx, "sample_rates", out_sample_rates, -1, AV_OPT_SEARCH_CHILDREN), "Could not set output sample rate: %s");

  outputs->name = av_strdup("in");
  outputs->filter_ctx = *bufsrc_ctx;
  outputs->pad_idx = 0;
  outputs->next = NULL;

  inputs->name = av_strdup("out");
  inputs->filter_ctx = *bufsink_ctx;
  inputs->pad_idx = 0;
  inputs->next = NULL;

  HANDLE_AV_ERROR(avfilter_graph_parse_ptr(*graph, filter_desc, &inputs, &outputs, NULL), "Could not parse filter string: %s");
  HANDLE_AV_ERROR(avfilter_graph_config(*graph, NULL), "Could not configure filter graph: %s");

  const AVFilterLink *link = (*bufsink_ctx)->inputs[0];
  av_get_channel_layout_string(buf, BUF_SIZE, -1, link->channel_layout);
  sample_fmt_name = av_get_sample_fmt_name(link->format);

  print_log(
    "Output: sample rate = %d; sample format = %s; channel layout=%s",
    (int)link->sample_rate,
    av_x_if_null(sample_fmt_name, "?"),
    buf
  );

  avfilter_inout_free(&inputs);
  avfilter_inout_free(&outputs);
  return 0;

ON_ERROR
  if (inputs) {
    avfilter_inout_free(&inputs);
  }
  if (outputs) {
    avfilter_inout_free(&outputs);
  }
  return -1;
}

int decode_audio(
  const char *fname,
  int frame_size,
  int (*process_frame)(float*, int, int, void*),
  void *process_frame_data,
  int process_incomplete_frame
) {
  AVFormatContext *fctx = NULL;
  AVCodecContext *cctx = NULL;
  AVFrame *frame = NULL;
  AVFrame *filtered_frame = NULL;
  AVPacket *packet = NULL;
  int stream = -1;

  float *frame_buffer = NULL;
  int frame_buffer_offset = 0;

  AVFilterGraph *graph = NULL;
  AVFilterContext *bufsrc_ctx = NULL;
  AVFilterContext *bufsink_ctx = NULL;

  HANDLE_RC(stream = find_audio_stream(fname, &fctx, &cctx), NULL);
  int sample_rate = cctx->sample_rate;
  int channels = cctx->channels;
  print_log("\nAudio stream = %d; sample rate = %d; channels = %d", stream, sample_rate, channels);

  HANDLE_RC(create_filter_graph(fctx, cctx, stream, &graph, &bufsrc_ctx, &bufsink_ctx), NULL);

  HANDLE_NULL(frame = av_frame_alloc(), "Could not allocate frame");
  HANDLE_NULL(filtered_frame = av_frame_alloc(), "Could not allocate filtered frame");
  HANDLE_NULL(packet = av_packet_alloc(), "Could not allocate packet");
  HANDLE_NULL(frame_buffer = calloc(frame_size, sizeof(*frame_buffer)), "Could not allocate frame buffer");

  int packets = 0, total_packets = 0;
  int frames = 0, filtered_frames = 0, processed_frames = 0;
  int rc;
  while((rc = av_read_frame(fctx, packet)) != AVERROR_EOF) {
    if (rc < 0) {
      ERROR("Could not read frame: %s", av_err2str(rc));
    }

    ++total_packets;

    if(packet->stream_index == stream) {
      ++packets;
      HANDLE_AV_ERROR(avcodec_send_packet(cctx, packet), "Could not send packet #%d: %s", packets);
      rc = avcodec_receive_frame(cctx, frame);
      if (rc == AVERROR(EAGAIN) || rc == AVERROR_EOF) {
        continue;
      }
      ++frames;
      if (rc < 0) {
        ERROR("Could not receive frame #%d: %s", frames, av_err2str(rc));
      }

      HANDLE_AV_ERROR(av_buffersrc_add_frame_flags(bufsrc_ctx, frame, AV_BUFFERSRC_FLAG_KEEP_REF), "Could not send frame #%d to filter graph: %s", frame);
      while (1) {
        rc = av_buffersink_get_frame(bufsink_ctx, filtered_frame);
        if (rc == AVERROR(EAGAIN) || rc == AVERROR_EOF) {
          break;
        }
        ++filtered_frames;
        if (rc < 0) {
          ERROR("Could not receive filtered frame #%d: %s", filtered_frames, av_err2str(rc));
        }

        if (process_frame) {
          const float *data = (float*)filtered_frame->data[0];
          int data_length = filtered_frame->nb_samples;
          int data_offset = 0;

          while (data_length + frame_buffer_offset >= frame_size) {
            int copy = frame_size - frame_buffer_offset;
            memmove(
              frame_buffer + frame_buffer_offset,
              data + data_offset,
              copy * sizeof(*data)
            );
            data_offset += copy;
            data_length -= copy;
            frame_buffer_offset = 0;
            ++processed_frames;
            HANDLE_RC(rc = process_frame(frame_buffer, frame_size, RESAMPLE_RATE, process_frame_data), "Could not process frame #%d", filtered_frames);
            if (rc) {
              print_log("process_frame() returned %d; stopping", rc);
              goto end;
            }
          }
          if (data_length) {
            memmove(
              frame_buffer + frame_buffer_offset,
              data + data_offset,
              data_length * sizeof(*data)
            );
            frame_buffer_offset += data_length;
          }
        }

        av_frame_unref(filtered_frame);
      }

      av_frame_unref(frame);
    }

    av_packet_unref(packet);
  }

  if (frame_buffer_offset && process_incomplete_frame) {
    memset(
     frame_buffer + frame_buffer_offset,
     0,
     (frame_size - frame_buffer_offset) * sizeof(*frame_buffer)
    );
    frame_buffer_offset = 0;
    ++processed_frames;
    HANDLE_RC(process_frame(frame_buffer, frame_size, sample_rate, process_frame_data), "Could not process frame #%d", filtered_frames);
  }

end:
  print_log("Processed frames: %d", processed_frames);
  print_log("Filtered frames: %d", filtered_frames);
  print_log("Audio frames: %d", frames);
  print_log("Audio packets: %d", packets);
  print_log("Total packets: %d", total_packets);

  avfilter_graph_free(&graph);
  avformat_close_input(&fctx);
  avcodec_free_context(&cctx);
  av_frame_free(&frame);
  av_frame_free(&filtered_frame);
  av_packet_free(&packet);
  free(frame_buffer);
  return 0;

ON_ERROR
  if (graph) {
    avfilter_graph_free(&graph);
  }
  if (fctx) {
    avformat_close_input(&fctx);
  }
  if (cctx) {
    avcodec_free_context(&cctx);
  }
  if (frame) {
    av_frame_free(&frame);
  }
  if (filtered_frame) {
    av_frame_free(&filtered_frame);
  }
  if (packet) {
    av_packet_free(&packet);
  }
  if (frame_buffer) {
    free(frame_buffer);
  }
  return -1;
}


static const AVCodec* get_audio_codec_from_filename(const char *fname) {
  const AVCodec *codec = NULL;
  enum AVCodecID codec_id = AV_CODEC_ID_NONE;
  AVOutputFormat *fmt = av_guess_format(NULL, fname, NULL);
  if (!fmt) {
    ERROR("Could not guess format for file name \"%s\"", fname);
  }
  codec_id = av_guess_codec(fmt, NULL, NULL, NULL, AVMEDIA_TYPE_AUDIO);
  if (codec_id == AV_CODEC_ID_NONE) {
    ERROR("Could not guess audio codec id for file name \"%s\"", fname);
  }
  HANDLE_NULL(codec = avcodec_find_encoder(AV_CODEC_ID_AAC), "Could not find encoder");
  return codec;
ON_ERROR
  return NULL;
}

static int check_sample_fmt(const AVCodec *codec, enum AVSampleFormat fmt)
{
  const enum AVSampleFormat *p;
  for (p = codec->sample_fmts; *p != AV_SAMPLE_FMT_NONE; ++p) {
    //print_log("fmt %d %d", *p, fmt);
    if (*p == fmt) {
      return 1;
    }
  }
  return 0;
}

static int check_sample_rate(const AVCodec *codec, int sample_rate)
{
  if (!codec->supported_samplerates) {
    return 1;
  }
  for (const int *p = codec->supported_samplerates; *p; ++p) {
    if (*p == sample_rate) {
      return 1;
    }
  }
  return 0;
}

static int create_audio_encoder(
  const char *fname,
  int sample_rate,
  AVFormatContext **fctx,
  AVCodecContext **ctx
) {
  enum { CHANNELS = 1, BIT_RATE = 192000, SAMPLE_FMT = AV_SAMPLE_FMT_FLTP };
  const AVCodec *codec = NULL;
  AVIOContext *ioctx = NULL;
  AVStream *stream = NULL;

  HANDLE_AV_ERROR(avio_open(&ioctx, fname, AVIO_FLAG_WRITE), "Could not open output file \"%s\": %s", fname);
  HANDLE_NULL(*fctx = avformat_alloc_context(), "Could not allocate format context");
  (*fctx)->pb = ioctx;

  HANDLE_NULL((*fctx)->oformat = av_guess_format(NULL, fname, NULL), "Could not find output file format");
  //av_strlcpy((*fctx)->filename, fname, sizeof((*fctx)->filename));

  HANDLE_NULL(codec = avcodec_find_encoder(AV_CODEC_ID_VORBIS), "Could not find encoder");
  if (!check_sample_fmt(codec, SAMPLE_FMT)) {
    ERROR("Encoder %s does not support sample format %s", codec->name, av_get_sample_fmt_name(SAMPLE_FMT));
  }
  if (!check_sample_rate(codec, sample_rate)) {
    ERROR("Encoder %s does not support sample rate %d", codec->name, sample_rate);
  }

  HANDLE_NULL(stream = avformat_new_stream(*fctx, NULL), "Could not create output stream");
  stream->time_base.den = sample_rate;
  stream->time_base.num = 1;

  HANDLE_NULL(*ctx = avcodec_alloc_context3(codec), "Could not allocate codec context");
  (*ctx)->channels = CHANNELS;
  (*ctx)->channel_layout = av_get_default_channel_layout(CHANNELS);
  (*ctx)->sample_rate = sample_rate;
  (*ctx)->sample_fmt = SAMPLE_FMT;
  (*ctx)->bit_rate = BIT_RATE;
  if ((*fctx)->oformat->flags & AVFMT_GLOBALHEADER) {
    (*ctx)->flags |= AV_CODEC_FLAG_GLOBAL_HEADER;
  }

  HANDLE_AV_ERROR(avcodec_open2(*ctx, codec, NULL), "Could not open output codec: %s");
  HANDLE_AV_ERROR(avcodec_parameters_from_context(stream->codecpar, *ctx), "Could not initialize output stream: %s");

  HANDLE_AV_ERROR(avformat_write_header(*fctx, NULL), "Could not write file header: %s");

  return 0;

ON_ERROR
  if (ioctx) {
    avio_close(ioctx);
  }
  if (*fctx) {
    avformat_free_context(*fctx);
    *fctx = NULL;
  }
  if (*ctx) {
    avcodec_free_context(ctx);
    *ctx = NULL;
  }
  return -1;
}

static int encode_frame(
  AVFormatContext *fctx,
  AVCodecContext *ctx,
  AVFrame *frame,
  AVPacket *packet,
  int *frames,
  int *packets
) {
  if (frame) {
    frame->pts = (int64_t)*frames * frame->nb_samples;
  }
  ++*frames;
  HANDLE_AV_ERROR(avcodec_send_frame(ctx, frame), "Could not send frame #%d: %s", *frames);
  while (1) {
    int rc = avcodec_receive_packet(ctx, packet);
    if (rc == AVERROR(EAGAIN) || rc == AVERROR_EOF) {
      break;
    }
    ++*packets;
    if (rc < 0) {
      ERROR("Could not receive packet #%d: %s", *packets, av_err2str(rc));
    }
    HANDLE_AV_ERROR(av_write_frame(fctx, packet), "Could not write packet #%d: %s", *packets);
    av_packet_unref(packet);
  }
  return 0;
ON_ERROR
  return -1;
}


int encode_audio(
  const char *fname,
  int generated_frame_size,
  int sample_rate,
  process_frame_t generate_frame,
  void *generate_frame_data
) {
  float *buf = NULL;
  AVFormatContext *fctx = NULL;
  AVCodecContext *ctx = NULL;
  AVFrame *frame = NULL;
  AVPacket *packet = NULL;
  int frames = 0;
  int packets = 0;
  int generated_frames = 0;
  int frame_offset = 0;

  HANDLE_RC(create_audio_encoder(fname, sample_rate, &fctx, &ctx), NULL);
  HANDLE_NULL(frame = av_frame_alloc(), "Could not allocate frame");
  HANDLE_NULL(packet = av_packet_alloc(), "Could not allocate packet");
  HANDLE_NULL(buf = calloc(generated_frame_size, sizeof(*buf)), "Could not allocate buffer");

  frame->nb_samples = ctx->frame_size;
  frame->format = ctx->sample_fmt;
  frame->channel_layout = ctx->channel_layout;
  frame->sample_rate = ctx->sample_rate;

  HANDLE_AV_ERROR(av_frame_get_buffer(frame, 0), "Could not allocate frame buffer");

  while (1) {
    int rc = generate_frame(buf, generated_frame_size, sample_rate, generate_frame_data);
    if (rc > 0) {
      break;
    }
    ++generated_frames;
    if (rc < 0) {
      ERROR("Could not generate frame #%d", generated_frames);
    }
    int i = 0;
    while (i < generated_frame_size) {
      int rem_buf = generated_frame_size - i;
      int rem_frame = frame->nb_samples - frame_offset;
      int copy = rem_buf >= rem_frame ? rem_frame : rem_buf;

      memmove((float*)frame->data[0] + frame_offset, buf + i, copy * sizeof(*buf));
      i += copy;
      frame_offset += copy;

      if (frame_offset >= frame->nb_samples) {
        frame_offset = 0;
        HANDLE_RC(encode_frame(fctx, ctx, frame, packet, &frames, &packets), NULL);
      }
    }
  }

  if (frame_offset) {
    memset(
      (float*)frame->data[0] + frame_offset,
      0,
      (frame->nb_samples - frame_offset) * sizeof(*buf)
    );
    HANDLE_RC(encode_frame(fctx, ctx, frame, packet, &frames, &packets), NULL);
  }

  HANDLE_RC(encode_frame(fctx, ctx, NULL, packet, &frames, &packets), NULL);

  print_log("Generated frames: %d", generated_frames);
  print_log("Encoded frames: %d", frames);
  print_log("Encoded packets: %d", packets);

  free(buf);
  av_frame_free(&frame);
  av_packet_free(&packet);
  avcodec_free_context(&ctx);
  avio_close(fctx->pb);
  avformat_free_context(fctx);
  return 0;

ON_ERROR
  if (buf) {
    free(buf);
  }
  if (frame) {
    av_frame_free(&frame);
  }
  if (packet) {
    av_packet_free(&packet);
  }
  if (ctx) {
    avcodec_free_context(&ctx);
  }
  if (fctx) {
    if (fctx->pb) {
      avio_close(fctx->pb);
    }
    avformat_free_context(fctx);
  }
  return -1;
}
