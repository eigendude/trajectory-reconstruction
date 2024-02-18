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
# Build system for C++ libraries
#
# Required CMake variables:
#
#   CMAKE_FIND_ROOT_PATH - Point this to dependencies compiled with Emscripten
#   CMAKE_INSTALL_PREFIX - Point this to the "public" folder
#
################################################################################

################################################################################
#
# Project settings
#
################################################################################

project(trajectory-reconstruction)

cmake_minimum_required(VERSION 3.0.0)

set(CMAKE_CXX_STANDARD 17)

################################################################################
#
# Dependencies
#
################################################################################

find_package(Ceres REQUIRED)
find_package(Eigen3 REQUIRED)
find_package(Glog REQUIRED)
find_package(OpenCV REQUIRED)

add_definitions(-DCERES_FOUND=1)

################################################################################
#
# Define sources
#
################################################################################

#
# Motion tracker
#

set(MOTION_TRACKER_SOURCES
  api/imgproc.cpp
  api/reconstruction.cpp
  api/scene.cpp
  api/video.cpp
  kernels/cpu/cpu_imgproc.cpp
  kernels/cpu/cpu_reconstruction.cpp
  kernels/cpu/cpu_scene.cpp
  kernels/cpu/cpu_video.cpp
  motion_tracker/motion_tracker.cpp
  motion_tracker/motion_tracker_embinder.cpp
  motion_tracker/vision_graph.cpp
  utils/emscripten_utils.cpp
  utils/frame_pool.cpp
  utils/image_utils.cpp
  utils/math_utils.cpp
)

################################################################################
#
# Build libraries
#
################################################################################

include_directories(
  ${CMAKE_SOURCE_DIR}
)

#
# Motion tracker
#

add_executable(motion_tracker
  ${MOTION_TRACKER_SOURCES}
)

target_include_directories(motion_tracker PRIVATE
  ${OpenCV_INCLUDE_DIRS}
)

target_link_libraries(motion_tracker PRIVATE
  ${OpenCV_LIBS}
)

if (${CMAKE_SYSTEM_NAME} MATCHES "Emscripten")
  set_target_properties(motion_tracker PROPERTIES
    COMPILE_FLAGS " \
      -O0 \
      -gsource-map \
      -s DISABLE_EXCEPTION_CATCHING=0 \
    "
    # 26214400 is 25 MiB
    LINK_FLAGS " \
      --bind \
      --source-map-base https://eigendude.github.io/ \
      -O0 \
      -gsource-map \
      -s DISABLE_EXCEPTION_CATCHING=0 \
      -s INITIAL_MEMORY=26214400 \
      -s EXPORT_ES6=1 \
      -s MODULARIZE=1 \
    "
  )
endif ()

################################################################################
#
# Install libraries
#
################################################################################

#
# Motion tracker
#

INSTALL(
  FILES
    "${CMAKE_BINARY_DIR}/motion_tracker.js"
    "${CMAKE_BINARY_DIR}/motion_tracker.wasm"
    "${CMAKE_BINARY_DIR}/motion_tracker.wasm.map"
  DESTINATION
    motion_tracker
)
