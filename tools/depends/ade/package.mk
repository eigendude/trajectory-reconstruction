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
# ADE Framework
#
# The ADE Framework is a graph construction, manipulation, and processing
# framework. ADE Framework is suitable for organizing data flow processing and
# execution.
#
# SPDX-License-Identifier: Apache-2.0
#
################################################################################

# Dependency name and version
ADE_REPO_NAME = ade
ADE_VERSION = 0.1.1f
ADE_REMOTE_REPO = https://github.com/opencv/$(ADE_REPO_NAME).git
ADE_LIB = libade.a

################################################################################
#
# Paths
#
################################################################################

# Checkout directory
REPO_DIR_ADE = $(REPO_DIR)/$(ADE_REPO_NAME)

# Build directory
BUILD_DIR_ADE = $(BUILD_DIR)/$(ADE_REPO_NAME)

# Build output
BUILD_FILE_ADE = $(BUILD_DIR_ADE)/lib/$(ADE_LIB)

# Install output
INSTALL_FILE_ADE = $(DEPENDS_DIR)/lib/$(ADE_LIB)

################################################################################
#
# Configuration
#
################################################################################

ADE_BUILD_DEPENDS = \
  $(S)/checkout-ade \
  $(S)/build-emsdk \

################################################################################
#
# Checkout
#
################################################################################

$(S)/checkout-ade: $(S)/.precheckout
	[ -d "$(REPO_DIR_ADE)" ] || ( \
	  git clone -b v$(ADE_VERSION) "$(ADE_REMOTE_REPO)" "$(REPO_DIR_ADE)" \
	)

	@# TODO: Repository sync is delegated to the CI system.

	touch "$@"

################################################################################
#
# Build
#
################################################################################

$(BUILD_FILE_ADE): $(S)/.prebuild $(ADE_BUILD_DEPENDS)
	mkdir -p "$(BUILD_DIR_ADE)"

	# Activate PATH and other environment variables in the current terminal and
	# build ADE
	. "$(REPO_DIR_EMSDK)/emsdk_set_env.sh" && \
	  cd "${BUILD_DIR_ADE}" && \
	  emcmake cmake "$(REPO_DIR_ADE)" \
	    -DCMAKE_INSTALL_PREFIX="$(DEPENDS_DIR)" \
	    -DCMAKE_BUILD_PARALLEL_LEVEL=$(shell getconf _NPROCESSORS_ONLN) \
	    $(shell ! command -v ccache &> /dev/null || echo "-DCMAKE_CXX_COMPILER_LAUNCHER=ccache") \

	#cmake --build "${BUILD_DIR_ADE}"
	make -C "${BUILD_DIR_ADE}" -j$(shell getconf _NPROCESSORS_ONLN)

	touch "$@"

$(S)/build-ade: $(BUILD_FILE_ADE)
	touch "$@"

################################################################################
#
# Install
#
################################################################################

$(INSTALL_FILE_ADE): $(S)/.preinstall $(S)/build-ade
	mkdir -p "$(DEPENDS_DIR)"

	cmake \
	  --build "${BUILD_DIR_ADE}" \
	  --target install

	touch "$@"

$(S)/install-ade: $(INSTALL_FILE_ADE)
	touch "$@"
