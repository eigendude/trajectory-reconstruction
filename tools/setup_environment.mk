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
