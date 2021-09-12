/*
 * Copyright (C) 2020 Marquise Stein
 * This file is part of 8bitbot - https://github.com/botocracy/8bitbot
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "scene.hpp"

scene::TplDoubles scene::CalcSceneScore(const cv::GMat& prevImg,
                          const cv::GMat& nextImg,
                          const cv::GOpaque<double>& prevMafd,
                          unsigned int width,
                          unsigned int height)
{
  return GCalcSceneScore::on(prevImg, nextImg, prevMafd, width, height);
}
