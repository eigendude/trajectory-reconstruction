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
# Eigen
#
# Eigen is a C++ template library for linear algebra: matrices, vectors,
# numerical solvers, and related algorithms.
#
# SPDX-License-Identifier: BSD-3-Clause
#
################################################################################

# Dependency name and version
EIGEN_REPO_NAME = eigen
EIGEN_VERSION = 3.3.7
EIGEN_REMOTE_REPO = https://gitlab.com/libeigen/$(EIGEN_REPO_NAME).git
EIGEN_HEADER = Matrix.h

################################################################################
#
# Paths
#
################################################################################

# Checkout directory
REPO_DIR_EIGEN = $(REPO_DIR)/$(EIGEN_REPO_NAME)

# Build directory
BUILD_DIR_EIGEN = $(BUILD_DIR)/$(EIGEN_REPO_NAME)

# Install output
INSTALL_FILE_EIGEN = $(DEPENDS_DIR)/include/eigen3/Eigen/src/Core/$(EIGEN_HEADER)

################################################################################
#
# Configuration
#
################################################################################

EIGEN_BUILD_DEPENDS = \
  $(S)/checkout-eigen \
  $(S)/build-emsdk

################################################################################
#
# Checkout
#
################################################################################

$(S)/checkout-eigen: $(S)/.precheckout
	[ -d "$(REPO_DIR_EIGEN)" ] ||  git clone -b $(EIGEN_VERSION) "$(EIGEN_REMOTE_REPO)" "$(REPO_DIR_EIGEN)"

	@# TODO: Repository sync is delegated to the CI system.

	touch "$@"

################################################################################
#
# Build
#
################################################################################

$(S)/build-eigen: $(S)/.prebuild $(EIGEN_BUILD_DEPENDS)
	mkdir -p "$(BUILD_DIR_EIGEN)"

	# Activate PATH and other environment variables in the current terminal and
	# build eigen
	. "$(REPO_DIR_EMSDK)/emsdk_set_env.sh" && \
	  cd "${BUILD_DIR_EIGEN}" && \
	  emcmake cmake "$(REPO_DIR_EIGEN)" \
	    -DCMAKE_INSTALL_PREFIX="$(DEPENDS_DIR)" \
	    -DCMAKE_BUILD_PARALLEL_LEVEL=$(shell getconf _NPROCESSORS_ONLN) \
	    $(shell ! command -v ccache &> /dev/null || echo "-DCMAKE_CXX_COMPILER_LAUNCHER=ccache") \

	cmake --build "${BUILD_DIR_EIGEN}"

	touch "$@"

################################################################################
#
# Install
#
################################################################################

$(INSTALL_FILE_EIGEN): $(S)/.preinstall $(S)/build-eigen
	mkdir -p "$(DEPENDS_DIR)"

	cmake \
	  --build "${BUILD_DIR_EIGEN}" \
	  --target install

	touch "$@"

$(S)/install-eigen: $(INSTALL_FILE_EIGEN)
	touch "$@"
