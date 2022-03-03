/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

import { Observable, Subject } from "threads/observable";
import { expose } from "threads/worker";

import Module from "../../public/motion_tracker/motion_tracker.js";

// Motion tracker
let tracker;

// Streaming worker results
let frameProcessedSubject = new Subject();

// Promise that is resolved when module runtime is initialized
let resolveInitialize;
let runtimeInitialized = new Promise((resolve, reject) => {
  resolveInitialize = resolve;
});

// Called when WASM module is initialized
Module.onRuntimeInitialized = (_) => {
  resolveInitialize();
};

const motionTracker = {
  async initialize() {
    await runtimeInitialized;

    tracker = new Module.MotionTracker();
  },

  async open(videoWidth, videoHeight) {
    return tracker.initialize(videoWidth, videoHeight);
  },

  async addVideoFrame(pts, pixelBuffer, byteOffset, byteLength) {
    if (!tracker) {
      throw new Error("Motion tracker is not initialized");
    }

    const pixelData = new Uint8ClampedArray(
      pixelBuffer,
      byteOffset,
      byteLength
    );

    const frameInfo = tracker.addVideoFrame(pixelData);

    const sceneScore = frameInfo.sceneScore;
    const points = frameInfo.points;
    const initialPoints = frameInfo.initialPoints;
    const projectionMatrix = frameInfo.projectionMatrix;

    //console.log(frameInfo);

    //console.log(`Points: (${points})`);

    /*
    // Get reference to WASM memory holding the points
    var pointHeap = new Float32Array(
      Module.HEAPU8.buffer,
      pointData,
      pointCount / 2
    );

    // Allocate new point data
    const pointBuffer = new ArrayBuffer(
      pointCount * pointHeap.BYTES_PER_ELEMENT
    );
    const points = new Float32Array(pointBuffer);

    // Copy points
    points.set(pointHeap);

    const projectionMatrix = frameInfo.projectionMatrixData; // TODO
    */

    frameProcessedSubject.next({
      pts,
      sceneScore,
      points,
      initialPoints,
      projectionMatrix,
    });

    return true;
  },

  async close() {
    tracker.deinitialize();
  },

  onFrameProcessed() {
    return Observable.from(frameProcessedSubject);
  },
};

expose(motionTracker);
