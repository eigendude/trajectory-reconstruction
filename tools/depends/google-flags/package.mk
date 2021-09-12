################################################################################
#
#  Copyright (C) 2020 Marquise Stein
#  This file is part of 8bitbot - https://github.com/botocracy/8bitbot
#
#  SPDX-License-Identifier: Apache-2.0
#  See the file LICENSE.txt for more information.
#
################################################################################

################################################################################
#
# gflags
#
# The gflags package contains a C++ library that implements commandline flags
# processing.
#
# SPDX-License-Identifier: BSD-3-Clause
#
################################################################################

# Dependency name and version
GFLAGS_REPO_NAME = gflags
GFLAGS_VERSION = 2.2.2
GFLAGS_REMOTE_REPO = https://github.com/gflags/$(GFLAGS_REPO_NAME).git
GFLAGS_LIB = libgflags.a

################################################################################
#
# Paths
#
################################################################################

# Checkout directory
REPO_DIR_GFLAGS = $(REPO_DIR)/$(GFLAGS_REPO_NAME)

# Build directory
BUILD_DIR_GFLAGS = $(BUILD_DIR)/$(GFLAGS_REPO_NAME)

# Build output
BUILD_FILE_GFLAGS = $(BUILD_DIR_GFLAGS)/lib/$(GFLAGS_LIB)

# Install output
INSTALL_FILE_GFLAGS = $(DEPENDS_DIR)/lib/$(GFLAGS_LIB)

################################################################################
#
# Configuration
#
################################################################################

GFLAGS_BUILD_DEPENDS = \
  $(S)/checkout-gflags \
  $(S)/build-emsdk

################################################################################
#
# Checkout
#
################################################################################

$(S)/checkout-gflags: $(S)/.precheckout
	[ -d "$(REPO_DIR_GFLAGS)" ] || ( \
	  git clone -b v$(GFLAGS_VERSION) "$(GFLAGS_REMOTE_REPO)" "$(REPO_DIR_GFLAGS)" \
	)

	@# TODO: Repository sync is delegated to the CI system.

	touch "$@"

################################################################################
#
# Build
#
################################################################################

$(BUILD_FILE_GFLAGS): $(S)/.prebuild $(GFLAGS_BUILD_DEPENDS)
	mkdir -p "$(BUILD_DIR_GFLAGS)"

	# Activate PATH and other environment variables in the current terminal and
	# build gflags
	. "$(REPO_DIR_EMSDK)/emsdk_set_env.sh" && \
	  cd "${BUILD_DIR_GFLAGS}" && \
	  emcmake cmake "$(REPO_DIR_GFLAGS)" \
	    -DCMAKE_INSTALL_PREFIX="$(DEPENDS_DIR)" \
	    -DCMAKE_BUILD_PARALLEL_LEVEL=$(shell getconf _NPROCESSORS_ONLN) \
	    $(shell ! command -v ccache &> /dev/null || echo "-DCMAKE_CXX_COMPILER_LAUNCHER=ccache") \

	#cmake --build "${BUILD_DIR_GFLAGS}"
	make -C "${BUILD_DIR_GFLAGS}" -j$(shell getconf _NPROCESSORS_ONLN)

	touch "$@"

$(S)/build-gflags: $(BUILD_FILE_GFLAGS)
	touch "$@"

################################################################################
#
# Install
#
################################################################################

$(INSTALL_FILE_GFLAGS): $(S)/.preinstall $(S)/build-gflags
	mkdir -p "$(DEPENDS_DIR)"

	cmake \
	  --build "${BUILD_DIR_GFLAGS}" \
	  --target install

	touch "$@"

$(S)/install-gflags: $(INSTALL_FILE_GFLAGS)
	touch "$@"
