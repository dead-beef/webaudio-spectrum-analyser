CC = gcc
CFLAGS = -Wall -O2 -std=gnu99

SRC_DIR := src
INCLUDE_DIR := include
APP_SRC_DIR := ../../apps/webaudio-spectrum-analyser/src/app
WASM_SRC_DIR := $(APP_SRC_DIR)/wasm
DATA_DIR = data
WASM_LIB_DIR := ../../libs/wasm

INCLUDE_PATHS := -I$(APP_SRC_DIR) -I$(WASM_LIB_DIR) -I $(WASM_LIB_DIR)/kissfft -I$(INCLUDE_DIR)
CFLAGS += $(INCLUDE_PATHS)

BIN_DIR := .
OBJ_DIR := build/obj
DEP_DIR := build/dep

LDFLAGS := -lm -lavcodec -lavformat -lavfilter -lavutil

make_path = $(addsuffix $(1), $(basename $(subst $(2), $(3), $(4))))
src_to_obj = $(call make_path,.o, $(SRC_DIR), $(OBJ_DIR), $(1))
src_to_dep = $(call make_path,.d, $(SRC_DIR), $(DEP_DIR), $(1))

ALL_EXECUTABLES :=
ALL_CFILES :=

WASM_C := $(WASM_SRC_DIR)/index.c
WASM_OBJ := $(OBJ_DIR)/wasm.o
WASM_DEPS := $(DEP_DIR)/wasm.d
#ALL_CFILES += $(WASM_C)

COMMON_CFILES := $(SRC_DIR)/util.c $(SRC_DIR)/error.c $(SRC_DIR)/log.c $(SRC_DIR)/parse_arg.c $(SRC_DIR)/codec.c
COMMON_OBJECTS := $(foreach src, $(COMMON_CFILES), $(call src_to_obj, $(src)))
ALL_CFILES += $(COMMON_CFILES)


PA_CFILES := $(SRC_DIR)/process.c
PA_OBJECTS := $(foreach src, $(PA_CFILES), $(call src_to_obj, $(src)))
PA_OBJECTS += $(WASM_OBJ)
PA_OBJECTS += $(COMMON_OBJECTS)
PA_EXECUTABLE := $(BIN_DIR)/process
PA_LDFLAGS :=
ALL_CFILES += $(PA_CFILES)
ALL_EXECUTABLES += $(PA_EXECUTABLE)

$(PA_EXECUTABLE): $(PA_OBJECTS) | $(BIN_DIR)
	$(CC) $(CFLAGS) $^ -o $@ $(LDFLAGS) $(PA_LDFLAGS)


GA_CFILES := $(SRC_DIR)/generate.c
GA_OBJECTS := $(foreach src, $(GA_CFILES), $(call src_to_obj, $(src)))
GA_OBJECTS += $(WASM_OBJ)
GA_OBJECTS += $(COMMON_OBJECTS)
GA_EXECUTABLE := $(BIN_DIR)/generate
GA_LDFLAGS :=
ALL_CFILES += $(GA_CFILES)
ALL_EXECUTABLES += $(GA_EXECUTABLE)

$(GA_EXECUTABLE): $(GA_OBJECTS) | $(BIN_DIR)
	$(CC) $(CFLAGS) $^ -o $@ $(LDFLAGS) $(GA_LDFLAGS)


GAW_CFILES := $(SRC_DIR)/generate_wave.c
GAW_OBJECTS := $(foreach src, $(GAW_CFILES), $(call src_to_obj, $(src)))
GAW_OBJECTS += $(WASM_OBJ)
GAW_OBJECTS += $(COMMON_OBJECTS)
GAW_EXECUTABLE := $(BIN_DIR)/generate-wave
GAW_LDFLAGS :=
ALL_CFILES += $(GAW_CFILES)
ALL_EXECUTABLES += $(GAW_EXECUTABLE)

$(GAW_EXECUTABLE): $(GAW_OBJECTS) | $(BIN_DIR)
	$(CC) $(CFLAGS) $^ -o $@ $(LDFLAGS) $(GAW_LDFLAGS)


DEPS := $(foreach src, $(ALL_CFILES), $(call src_to_dep, $(src)))
DEPS += $(WASM_DEPS)

.DEFAULT_GOAL := all
NODEPS = clean

all: $(ALL_EXECUTABLES)

clean:
	rm -rvf $(OBJ_DIR)/* $(DEP_DIR)/* $(ALL_EXECUTABLES)

Makefile: ;

$(DEP_DIR)/%.d: $(SRC_DIR)/%.c | $(DEP_DIR)
	$(CC) $(INCLUDE_PATHS) -MM -MT $(call src_to_obj,$<) -MF $@ $<

$(OBJ_DIR)/%.o: $(SRC_DIR)/%.c $(DEP_DIR)/%.d | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c -o $@ $<

$(DEP_DIR) $(OBJ_DIR) $(BIN_DIR):
	mkdir -p $@

$(WASM_OBJ): $(WASM_C) $(WASM_DEPS) | $(OBJ_DIR)
	$(CC) $(CFLAGS) -c -o $@ $<

$(WASM_DEPS): $(WASM_C) | $(DEP_DIR)
	$(CC) $(INCLUDE_PATHS) -MM -MT $(WASM_OBJ) -MF $@ $<

$(DEPS):

ifeq (0, $(words $(findstring $(MAKECMDGOALS), $(NODEPS))))
include $(wildcard $(DEP_DIR)/*)
endif
