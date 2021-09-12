#!/bin/bash
################################################################################
#
#  Copyright (C) 2019-2020 Marquise Stein
#  This file is part of 8bitbot - https://github.com/botocracy/8bitbot
#
#  SPDX-License-Identifier: Apache-2.0
#  See the file LICENSES/README.md for more information.
#
################################################################################

#
# NPM scripting entry point
#
# Call via:
#
#   npm-depends.sh <task>
#
# See the function dispatch() for the available tasks that can be run.
#

# Enable strict mode
set -o errexit
set -o pipefail
set -o nounset

# Absolute path to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

#
# Source includes
#

source "${SCRIPT_DIR}/npm-paths.sh"

#
# Dispatch function
#
# This function contains the available tasks. The first argument identifies
# which task to jump to.
#
function dispatch() {
  case $1 in
  all)
    depends-all
    ;;
  checkout)
    depends-checkout
    ;;
  build)
    depends-build
    ;;
  install)
    depends-install
    ;;
  *)
    echo "Invalid task: $1"
    exit 1
    ;;
  esac
}

function depends-all() {
  # Dependencies to build
  BUILD_DEPENDS="emscripten "

  # Build OpenCV
  if [ ! -f "${GENERATED_SOURCE_DIR}/opencv.js" ] \
    || [ ! -f "${DISTRIBUTION_LIB_DIR}/libopencv_core.a" ]; then
    rm -f "${STAMP_DIR}/build-opencv"
    BUILD_DEPENDS+="opencv "
  fi

  make -C "${TOOL_DIR}" -j$(getconf _NPROCESSORS_ONLN) ${BUILD_DEPENDS}

  # Build C++ libraries
  "${CPP_LIBRARY_DIR}/build-ci.sh"
}

function depends-checkout() {
  make -C "${TOOL_DIR}" checkout -j10
}

function depends-build() {
  make -C "${TOOL_DIR}" build -j$(getconf _NPROCESSORS_ONLN)
}

function depends-install() {
  make -C "${TOOL_DIR}" install
}

# Perform the dispatch
dispatch $1
