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
# Set properties based on the environment
#
################################################################################

#
# Operating system detection
#

PLATFORM =
ifeq ($(OS),Windows_NT)
	PLATFORM = windows
else
	KERNEL_NAME = $(shell uname -s)
	ifeq ($(KERNEL_NAME),Linux)
		PLATFORM = linux
	else ifeq ($(KERNEL_NAME),Darwin)
		PLATFORM = darwin
	else
		PROCESSOR = $(shell uname -p)
		ifneq ($(filter arm%,$(PROCESSOR)),)
			PLATFORM = arm
		endif
	endif
endif
