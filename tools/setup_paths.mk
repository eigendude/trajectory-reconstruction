################################################################################
#
#  Copyright (C) 2020 Garrett Brown
#  This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
#
#  SPDX-License-Identifier: Apache-2.0
#  See the file LICENSE.txt for more information.
#
################################################################################

################################################################################
#
# Set paths for build system early setup
#
################################################################################

# Directory for tooling
TOOL_DIR = $(shell pwd)

# Directory of stamps for tracking build progress
STAMP_DIR = $(TOOL_DIR)/stamps

# Shorten variable name for Makefile stamp idiom
S = $(STAMP_DIR)

# Directory for storing dependency repositories
REPO_DIR = $(TOOL_DIR)/repos

# Directory of building dependencies
BUILD_DIR = $(TOOL_DIR)/build

# Directory to place generated files
INSTALL_DIR = $(TOOL_DIR)/../src/generated

# Directory to place C++ library dependencies
DEPENDS_DIR = $(TOOL_DIR)/dist

# Stamp files for build system stages
CHECKOUT_DONE = $(STAMP_DIR)/.checkout-done
BUILD_DONE = $(STAMP_DIR)/.build-done
INSTALL_DONE = $(STAMP_DIR)/.install-done
