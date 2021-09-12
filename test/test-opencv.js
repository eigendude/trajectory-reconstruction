/*
 * Copyright (C) 2019-2020 Marquise Stein
 * This file is part of 8bitbot - https://github.com/botocracy/8bitbot
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

import chai from "chai";

import cv from "../src/generated/opencv";
import { MotionTracker } from "../src/motiontracker";

describe("opencv.js", function () {
  before(async function () {
    this.cv = await cv;
  });

  it("should be imported", async function () {
    chai.expect(this.cv).to.be.an("object");
  });

  it("should create a point", async function () {
    const point = new this.cv.Point(-1, -1);
    chai.expect(point).to.be.a("object");
  });

  it("should create a matrix", async function () {
    const mat = new this.cv.Mat();
    chai.expect(mat).to.be.an("object");
  });

  it("should log the OpenCV version", async function () {
    const buildInfo = this.cv.getBuildInformation();

    chai.expect(buildInfo).to.be.a("string");

    const versionRegex = /Version control: +([0-9a-zA-Z.-]+)/;
    const version = this.cv.getBuildInformation().match(versionRegex)[1];

    console.log(`  OpenCV version: ${version}`);

    chai.expect(version).to.be.a("string");
  });
});
