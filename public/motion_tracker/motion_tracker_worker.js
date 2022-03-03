/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

(function () {
  let motionTracker;

  // TODO: Prefetch and load initial memory .mem file
  self.Module = {};

  Module.onRuntimeInitialized = function () {
    // note that emscripten Module is not completely initialized until postRun

    self.MotionTracker = Module.MotionTracker;
    self.MotionTrackerState = Module.MotionTrackerState;

    motionTracker = new self.MotionTracker();

    postMessage({
      type: "moduleInitialized",
    });
  };

  importScripts("motion_tracker.js");

  onmessage = function (event) {
    let msg = event.data;

    switch (msg.type) {
      case "open":
        const videoWidth = msg.videoWidth;
        const videoHeight = msg.videoHeight;
        open(videoWidth, videoHeight);
        break;

      case "addVideoFrame":
        const pts = msg.pts;
        const pixelBuffer = msg.pixelBuffer;
        const byteOffset = msg.byteOffset;
        const byteLength = msg.byteLength;

        const pixelData = new Uint8ClampedArray(
          pixelBuffer,
          byteOffset,
          byteLength
        );

        addVideoFrame(pts, pixelData);
        break;

      case "close":
        close();

      default:
        console.error(`Unknown message type: ${msg.type}`);
    }
  };

  function open(videoWidth, videoHeight) {
    if (!motionTracker) {
      postMessage({ error: "Motion tracker is not initialized" });
      return;
    }

    if (!motionTracker.initialize(videoWidth, videoHeight)) {
      postMessage({ error: "Failed to open motion tracker" });
    }
  }

  function addVideoFrame(pts, pixelData) {
    if (!motionTracker) {
      postMessage({ error: "Motion tracker is not initialized" });
      return;
    }

    const frameInfo = motionTracker.addVideoFrame(pixelData);

    const sceneScore = frameInfo.sceneScore;
    const pointData = frameInfo.pointData;
    const pointSize = frameInfo.pointSize;
    const initialPointData = frameInfo.initialPointData;
    const initialPointSize = frameInfo.initialPointSize;
    const projectionMatrixData = frameInfo.projectionMatrixData;
    const projectionMatrixSize = frameInfo.projectionMatrixSize;

    // Get reference to WASM memory
    const points = new Float32Array(Module.HEAPU8.buffer, pointData, pointSize);
    const initialPoints = new Float32Array(
      Module.HEAPU8.buffer,
      initialPointData,
      initialPointSize
    );

    // Allocate new data
    const pointBuffer = new ArrayBuffer(pointSize);
    const initialPointBuffer = new ArrayBuffer(initialPointSize);

    const pointDest = new Float32Array(pointSize);
    const initialPointDest = new Float32Array(initialPointSize);

    // Copy data
    pointDest.set(points);
    initialPointDest.set(initialPoints);

    // TODO: projection matrix
    postMessage(
      {
        type: "onFrameProcessed",
        pts: pts,
        sceneScore: sceneScore,
        pointBuffer: pointDest.buffer,
        pointOffset: pointDest.byteOffset,
        pointLength: pointDest.byteLength / Float32Array.BYTES_PER_ELEMENT,
        initialPointBuffer: initialPointDest.buffer,
        initialPointOffset: initialPointDest.byteOffset,
        initialPointLength:
          initialPointDest.byteLength / Float32Array.BYTES_PER_ELEMENT,
        //projectionMatrixBuffer: null,
      },
      [pointDest.buffer, initialPointDest.buffer]
    );
  }

  function close() {
    motionTracker.deinitialize();
  }
})();
