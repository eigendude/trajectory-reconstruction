/*
 * Copyright (C) 2020 Marquise Stein
 * This file is part of 8bitbot - https://github.com/botocracy/8bitbot
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

#include "cpu_video.hpp"

#include "api/video.hpp"

#include <opencv2/gapi/cpu/imgproc.hpp>
#include <opencv2/gapi/cpu/gcpukernel.hpp>

namespace video
{
  // Predict points for optical flow
  GAPI_OCV_KERNEL(GCPUPredictPoints, GPredictPoints)
  {
    static void run(const std::vector<std::vector<cv::Point2f>>& pointHistory,
                    std::vector<cv::Point2f>& predictedPoints)
    {
      predictedPoints.resize(pointHistory[0].size());

      // TODO
      predictedPoints = pointHistory.back();
    }
  };
}

cv::gapi::GKernelPackage video::kernels()
{
  static auto pkg = cv::gapi::kernels
    < GCPUPredictPoints
    >();

  return pkg;
}
