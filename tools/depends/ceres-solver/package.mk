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
# Ceres Solver
#
# Ceres Solver is an open source C++ library for modeling and solving large,
# complicated optimization problems.
#
# Ceres Solver can solve two kinds of problems.
#
#   1. Non-linear Least Squares problems with bounds constraints
#   2. General unconstrained optimization problems
#
# SPDX-License-Identifier: BSD-3-Clause
#
################################################################################

# Dependency name and version
CERES_REPO_NAME = ceres-solver
CERES_VERSION = 1.14.0
CERES_REMOTE_REPO = https://github.com/ceres-solver/$(CERES_REPO_NAME).git
CERES_LIB = libceres.a

################################################################################
#
# Paths
#
################################################################################

# Checkout directory
REPO_DIR_CERES = $(REPO_DIR)/$(CERES_REPO_NAME)

# Build directory
BUILD_DIR_CERES = $(BUILD_DIR)/$(CERES_REPO_NAME)

# Build output
BUILD_FILE_CERES = $(BUILD_DIR_CERES)/lib/$(CERES_LIB)

# Install output
INSTALL_FILE_CERES = $(DEPENDS_DIR)/lib/$(CERES_LIB)

################################################################################
#
# Configuration
#
################################################################################

CERES_BUILD_DEPENDS = \
  $(S)/checkout-ceres \
  $(S)/build-emsdk \
  $(S)/install-gflags \
  $(S)/install-glog \
  $(S)/install-eigen \

################################################################################
#
# Checkout
#
################################################################################

$(S)/checkout-ceres: $(S)/.precheckout
	[ -d "$(REPO_DIR_CERES)" ] ||  ( \
	  git clone -b $(CERES_VERSION) "$(CERES_REMOTE_REPO)" "$(REPO_DIR_CERES)" \
	)

	@# TODO: Repository sync is delegated to the CI system.

	touch "$@"

################################################################################
#
# Build
#
################################################################################

$(BUILD_FILE_CERES): $(S)/.prebuild $(CERES_BUILD_DEPENDS)
	mkdir -p "$(BUILD_DIR_CERES)"

	# Activate PATH and other environment variables in the current terminal and
	# build ceres
	. "$(REPO_DIR_EMSDK)/emsdk_set_env.sh" && \
	  cd "${BUILD_DIR_CERES}" && \
	  emcmake cmake "$(REPO_DIR_CERES)" \
	    -DCMAKE_FIND_ROOT_PATH="$(DEPENDS_DIR)" \
	    -DCMAKE_INSTALL_PREFIX="$(DEPENDS_DIR)" \
	    -DCMAKE_BUILD_PARALLEL_LEVEL=$(shell getconf _NPROCESSORS_ONLN) \
	    -DBUILD_TESTING=OFF \
	    -DBUILD_EXAMPLES=OFF \
	    -DBUILD_BENCHMARKS=OFF \
	    $(shell ! command -v ccache &> /dev/null || echo "-DCMAKE_CXX_COMPILER_LAUNCHER=ccache") \

	# Rebuilding takes a long time
	[ -f "$(BUILD_FILE_CERES)" ] || ( \
	  make -C "${BUILD_DIR_CERES}" -j$(shell getconf _NPROCESSORS_ONLN) \
	)

	touch "$@"

$(S)/build-ceres: $(BUILD_FILE_CERES)
	touch "$@"

################################################################################
#
# Install
#
################################################################################

$(INSTALL_FILE_CERES): $(S)/.preinstall $(S)/build-ceres
	mkdir -p "$(DEPENDS_DIR)"

	cmake \
	  --build "${BUILD_DIR_CERES}" \
	  --target install

	touch "$@"

$(S)/install-ceres: $(INSTALL_FILE_CERES)
	touch "$@"
