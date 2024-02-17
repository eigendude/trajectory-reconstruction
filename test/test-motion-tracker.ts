/*
 * Copyright (C) 2019-2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

import chai from "chai";
import { performance } from "perf_hooks";
import { spawn, Thread, Transfer, Worker } from "threads";

// Video dimensions
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

// Type for the frame info
interface FrameInfo {
  pts: number;
  sceneScore: number;
  points: any[]; // TODO
  initialPoints: any[]; // TODO
  projectionMatrix: any; // TODO
}

// Promise that is resolved when a decoded frame is processed
let resolveFrameProcessed: (value: FrameInfo | PromiseLike<FrameInfo>) => void;

describe("Motion tracker", function () {
  before(async function () {
    this.timeout(3000);

    // Motion tracker
    this.worker = await spawn(
      new Worker("../src/workers/motion_tracker_module")
    );
    this.worker
      .onFrameProcessed()
      .subscribe(
        ({
          pts,
          sceneScore,
          points,
          initialPoints,
          projectionMatrix,
        }: FrameInfo) => {
          const frameInfo: FrameInfo = {
            pts: pts,
            sceneScore: sceneScore,
            points: points,
            initialPoints: initialPoints,
            projectionMatrix: projectionMatrix,
          };
          resolveFrameProcessed(frameInfo);
        }
      );
  });

  after(async function () {
    if (this.worker) await Thread.terminate(this.worker);
  });

  it("should have spawned worker", async function () {
    chai.expect(this.worker).to.be.an("object");
  });

  it("should initialize the module worker", async function () {
    await this.worker.initialize();
  });

  it(`should open a stream of ${VIDEO_WIDTH}x${VIDEO_HEIGHT} video frames`, async function () {
    const result = await this.worker.open(VIDEO_WIDTH, VIDEO_HEIGHT);
    chai.expect(result, "result of worker.open()").to.be.true;
  });

  it(`should process frames`, async function () {
    function getFrame(fill: number): Uint8ClampedArray {
      // Allocate new pixel data
      let videoBuffer = new ArrayBuffer(VIDEO_WIDTH * VIDEO_HEIGHT * 4);
      let videoData = new Uint8ClampedArray(videoBuffer);
      for (let i = 0; i < VIDEO_WIDTH * VIDEO_HEIGHT * 4; i++) {
        videoData[i] = fill;
      }
      return videoData;
    }

    // Time that the first frame is presented
    const startPts = performance.now();

    function getPts() {
      return Math.round(performance.now() - startPts);
    }

    /*
     * 0x00
     */

    let videoData = getFrame(0x00);
    this.frameProcessed = new Promise((resolve, reject) => {
      resolveFrameProcessed = resolve;
    });
    let result = await this.worker.addVideoFrame(
      getPts(),
      Transfer(videoData.buffer),
      videoData.byteOffset,
      videoData.byteLength
    );
    let frameInfo = await this.frameProcessed;
    //console.log(frameInfo); // TODO

    /*
     * 0x01
     */

    videoData = getFrame(0x01);
    this.frameProcessed = new Promise((resolve, reject) => {
      resolveFrameProcessed = resolve;
    });
    result = await this.worker.addVideoFrame(
      getPts(),
      Transfer(videoData.buffer),
      videoData.byteOffset,
      videoData.byteLength
    );
    frameInfo = await this.frameProcessed;
    //console.log(frameInfo); // TODO

    /*
     * 0x02
     */

    videoData = getFrame(0x02);
    this.frameProcessed = new Promise((resolve, reject) => {
      resolveFrameProcessed = resolve;
    });
    result = await this.worker.addVideoFrame(
      getPts(),
      Transfer(videoData.buffer),
      videoData.byteOffset,
      videoData.byteLength
    );
    frameInfo = await this.frameProcessed;
    //console.log(frameInfo); // TODO

    /*
     * 0xff
     */

    videoData = getFrame(0xff);
    this.frameProcessed = new Promise((resolve, reject) => {
      resolveFrameProcessed = resolve;
    });
    result = await this.worker.addVideoFrame(
      getPts(),
      Transfer(videoData.buffer),
      videoData.byteOffset,
      videoData.byteLength
    );
    frameInfo = await this.frameProcessed;
    //console.log(frameInfo); // TODO

    /*
     * 0x00
     */

    videoData = getFrame(0x00);
    this.frameProcessed = new Promise((resolve, reject) => {
      resolveFrameProcessed = resolve;
    });
    result = await this.worker.addVideoFrame(
      getPts(),
      Transfer(videoData.buffer),
      videoData.byteOffset,
      videoData.byteLength
    );
    frameInfo = await this.frameProcessed;
    //console.log(frameInfo); // TODO

    /*
     * 0xff
     */

    videoData = getFrame(0xff);
    this.frameProcessed = new Promise((resolve, reject) => {
      resolveFrameProcessed = resolve;
    });
    result = await this.worker.addVideoFrame(
      getPts(),
      Transfer(videoData.buffer),
      videoData.byteOffset,
      videoData.byteLength
    );
    frameInfo = await this.frameProcessed;
    //console.log(frameInfo); // TODO
  });

  it("should terminate worker", async function () {
    this.timeout(20 * 1000);

    await this.worker.close();
    return Thread.terminate(this.worker);
  });
});
