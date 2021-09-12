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
# Google Logging Library
#
# The Google Logging Library (glog) implements application-level logging.
# The library provides logging APIs based on C++-style streams and various
# helper macros.
#
# SPDX-License-Identifier: BSD-3-Clause
#
################################################################################

# Dependency name and version
GLOG_REPO_NAME = glog
GLOG_VERSION = 0.4.0
GLOG_REMOTE_REPO = https://github.com/google/$(GLOG_REPO_NAME).git
GLOG_LIB = libglog.a

################################################################################
#
# Paths
#
################################################################################

# Checkout directory
REPO_DIR_GLOG = $(REPO_DIR)/$(GLOG_REPO_NAME)

# Build directory
BUILD_DIR_GLOG = $(BUILD_DIR)/$(GLOG_REPO_NAME)

# Build output
BUILD_FILE_GLOG = $(BUILD_DIR_GLOG)/$(GLOG_LIB)

# Install output
INSTALL_FILE_GLOG = $(DEPENDS_DIR)/lib/$(GLOG_LIB)

################################################################################
#
# Configuration
#
################################################################################

GLOG_BUILD_DEPENDS = \
  $(S)/checkout-glog \
  $(S)/build-emsdk \
  $(S)/install-gflags \

################################################################################
#
# Checkout
#
################################################################################

$(S)/checkout-glog: $(S)/.precheckout \
  $(TOOL_DIR)/depends/google-log/0001-Disable-syscalls-for-Emscripten.patch \
  $(TOOL_DIR)/depends/google-log/0002-Disable-symbolize-for-Emscripten.patch \
  $(TOOL_DIR)/depends/google-log/0003-Remove-email-code-for-Emscripten.patch
	[ -d "$(REPO_DIR_GLOG)" ] || ( \
	  git clone -b v$(GLOG_VERSION) "$(GLOG_REMOTE_REPO)" "$(REPO_DIR_GLOG)" \
	)

	@# TODO: Repository sync is delegated to the CI system.

	patch -p1 --forward --directory="$(REPO_DIR_GLOG)" < \
	  "$(TOOL_DIR)/depends/google-log/0001-Disable-syscalls-for-Emscripten.patch" || ( \
	    code=$$?; [[ "$${code}" -lt "2" ]] || exit $${code}; \
	  )

	patch -p1 --forward --directory="$(REPO_DIR_GLOG)" < \
	  "$(TOOL_DIR)/depends/google-log/0002-Disable-symbolize-for-Emscripten.patch" || ( \
	    code=$$?; [[ "$${code}" -lt "2" ]] || exit $${code}; \
	  )

	patch -p1 --forward --directory="$(REPO_DIR_GLOG)" < \
	  "$(TOOL_DIR)/depends/google-log/0003-Remove-email-code-for-Emscripten.patch" || ( \
	    code=$$?; [[ "$${code}" -lt "2" ]] || exit $${code}; \
	  )

	touch "$@"

################################################################################
#
# Build
#
################################################################################

$(BUILD_FILE_GLOG): $(S)/.prebuild $(GLOG_BUILD_DEPENDS)
	mkdir -p "$(BUILD_DIR_GLOG)"

	# Activate PATH and other environment variables in the current terminal and
	# build glog
	. "$(REPO_DIR_EMSDK)/emsdk_set_env.sh" && \
	  cd "${BUILD_DIR_GLOG}" && \
	  emcmake cmake "$(REPO_DIR_GLOG)" \
	    -DCMAKE_FIND_ROOT_PATH="$(DEPENDS_DIR)" \
	    -DCMAKE_INSTALL_PREFIX="$(DEPENDS_DIR)" \
	    $(shell ! command -v ccache &> /dev/null || echo "-DCMAKE_CXX_COMPILER_LAUNCHER=ccache") \

	cmake --build "${BUILD_DIR_GLOG}"

	touch "$@"

$(S)/build-glog: $(BUILD_FILE_GLOG)
	touch "$@"

################################################################################
#
# Install
#
################################################################################

$(INSTALL_FILE_GLOG): $(S)/.preinstall $(S)/build-glog
	mkdir -p "$(DEPENDS_DIR)"

	cmake \
	  --build "${BUILD_DIR_GLOG}" \
	  --target install

	touch "$@"

$(S)/install-glog: $(INSTALL_FILE_GLOG)
	touch "$@"
