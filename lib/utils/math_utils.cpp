/*
 * Copyright (C) 2020 Marquise Stein
 * This file is part of 8bitbot - https://github.com/botocracy/8bitbot
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "math_utils.hpp"

#include <cmath>

double MathUtils::GeometricMean(unsigned int width, unsigned int height)
{
  double product = static_cast<double>(width) * static_cast<double>(height);

  return std::sqrt(product);
}
