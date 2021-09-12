################################################################################
#
#  Copyright (C) 2019-2020 Marquise Stein
#  This file is part of 8bitbot - https://github.com/botocracy/8bitbot
#
#  SPDX-License-Identifier: Apache-2.0
#  See the file LICENSE.txt for more information.
#
################################################################################

################################################################################
#
# Build chain for dependendies
#
# Make is used to run shell commands instead of bash to allow for parallel
# intermediary build stages.
#
# The primary build stages that can be specified on the command line are:
#
#   1. checkout
#   2. patch
#   3. build
#   4. install (default if no stage is given)
#
# Two stages are used for cleaning temoprary files:
#
#   1. clean
#   2. distclean
#
# "make clean" is used to remove temporary build artifacts. "make distclean" is
# used to remove all temporary files and reset the directory to an unused state.
#
# This Makefile depends on the following packages:
#
#   - curl
#   - patch
#   - python3
#   - unzip
#
################################################################################

# Build system setup
include setup_stages.mk
include setup_paths.mk

# Build parameter setup
include setup_environment.mk

# Define the shell used to execute commands
SHELL := /bin/bash

################################################################################
#
# Import package rules
#
################################################################################

include depends/ade/package.mk
include depends/android-sdk/package.mk
include depends/ceres-solver/package.mk
include depends/eigen/package.mk
include depends/emscripten/package.mk
include depends/google-flags/package.mk
include depends/google-log/package.mk
include depends/opencv/package.mk

################################################################################
#
# Build system targets
#
# Defines the targets that are build when "make" is run.
#
################################################################################

#
# Define targets for "make checkout"
#

CHECKOUT_DEPENDS = \
  $(S)/checkout-ade \
  $(S)/checkout-ceres \
  $(S)/checkout-eigen \
  $(S)/checkout-emsdk \
  $(S)/checkout-gflags \
  $(S)/checkout-glog \
  $(S)/checkout-opencv \
  $(S)/patch-opencv

ifeq ($(PLATFORM),darwin)
  #CHECKOUT_DEPENDS += $(S)/checkout-android-sdk # TODO
endif

#
# Define targets for "make build"
#

BUILD_DEPENDS = \
  $(S)/build-opencv \

#
# Define targets for "make install"
#

INSTALL_DEPENDS = \
  $(S)/install-opencv \

#
# Inject targets
#

checkout: $(CHECKOUT_DEPENDS)
build: $(BUILD_DEPENDS)
install: $(INSTALL_DEPENDS)

#
# Define targets for building individual depends via "make <depend>"
#

.PHONY: ade
.PHONY: ceres
.PHONY: eigen
.PHONY: emscripten
.PHONY: gflags
.PHONY: glog
.PHONY: opencv

ade: \
  $(S)/install-ade

ceres: \
  $(S)/install-ceres

eigen: \
  $(S)/install-eigen

emscripten: \
  $(S)/build-emsdk

gflags: \
  $(S)/install-gflags

glog: \
  $(S)/install-glog

opencv: \
  $(S)/install-opencv

################################################################################
#
# Build system procedures
#
################################################################################

#
# Clean stage
#

clean:
	rm -rf "$(BUILD_DIR)"
	rm -rf "$(S)"

#
# Distclean stage
#

distclean: clean
	rm -rf "$(REPO_DIR)"
