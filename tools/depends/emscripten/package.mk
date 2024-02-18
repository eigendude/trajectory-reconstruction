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
# Emscripten SDK
#
# The Emscripten toolchain is distributed as a standalone Emscripten SDK. The
# SDK provides required tools, such as Clang, Python and Node.js.
#
# SPDX-License-Identifier: MIT
#
################################################################################

# Dependency name and version
EMSDK_REPO_NAME = emsdk
EMSDK_VERSION = 3.1.54
EMSDK_SDK_TOOLS_VERSION = latest
EMSDK_REMOTE_REPO = https://github.com/emscripten-core/$(EMSDK_REPO_NAME).git
EMSDK_BINARY = emsdk

################################################################################
#
# Paths
#
################################################################################

# Checkout directory
REPO_DIR_EMSDK = $(REPO_DIR)/$(EMSDK_REPO_NAME)

################################################################################
#
# Checkout
#
################################################################################

$(S)/checkout-emsdk: $(S)/.precheckout
	[ -d "$(REPO_DIR_EMSDK)" ] || git clone -b $(EMSDK_VERSION) "$(EMSDK_REMOTE_REPO)" "$(REPO_DIR_EMSDK)"

	@# TODO: Repository sync is delegated to the CI system.

	# Download and install the latest SDK tools.
	cd "$(REPO_DIR_EMSDK)" && \
	  "$(REPO_DIR_EMSDK)/emsdk" install --build=Release --shallow $(EMSDK_SDK_TOOLS_VERSION)

	touch "$@"

################################################################################
#
# Build
#
################################################################################

$(S)/build-emsdk: $(S)/.prebuild $(S)/checkout-emsdk
	# Make SDK "active" for the current user (writes .emscripten file)
	cd "$(REPO_DIR_EMSDK)" && \
	  "$(REPO_DIR_EMSDK)/emsdk" activate $(EMSDK_SDK_TOOLS_VERSION)

	# Create an evironment setup script
	cd "$(REPO_DIR_EMSDK)" && \
	  "$(REPO_DIR_EMSDK)/emsdk" construct_env

	touch "$@"
