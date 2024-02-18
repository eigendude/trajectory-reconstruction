/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

import { Observable, Subject } from "threads/observable";
import { expose } from "threads/worker";

import ModuleFactory from "../../public/motion_tracker/motion_tracker.js";

// Emscripten Module after initialization
let Module;

// Motion tracker instance
let tracker;

// Streaming worker results
let frameProcessedSubject = new Subject();

// Initialize the Emscripten Module and the MotionTracker
async function initializeModule() {
  if (!Module) {
    // Load and instantiate the Emscripten module
    Module = await ModuleFactory();

    // Create an instance of MotionTracker
    tracker = new Module.MotionTracker();
  }
}

const motionTracker = {
  async initialize() {
    // Ensure the Emscripten Module is initialized
    await initializeModule();
  },

  async open(videoWidth, videoHeight) {
    if (!tracker) {
      throw new Error("Motion tracker is not initialized");
    }

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
    if (!tracker) {
      throw new Error("Motion tracker is not initialized");
    }

    tracker.deinitialize();
  },

  onFrameProcessed() {
    return Observable.from(frameProcessedSubject);
  },
};

expose(motionTracker);
