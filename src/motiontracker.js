/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

import * as THREE from "three";

const WORKER_PATH = "/motion_tracker/motion_tracker_worker.js";

// Maximum size of the largest dimension
const MAX_RENDER_SIZE = 512;

// Promise that is resolved when a decoded frame is processed
let resolveFrameProcessed;

class MotionTracker {
  constructor(window) {
    // Construction parameters
    this.window = window;

    // Video resource
    this.video = null;

    // Web worker
    this.motionWorker = new Worker(new URL(WORKER_PATH, import.meta.url), {
      type: "module",
    });
    this.motionWorkerInitialized = false;
    this.motionWorkerOpen = false;

    // Canvas handles
    this.renderCanvas = document.getElementById("renderCanvas");
    this.overlayCanvas2D = document.getElementById("overlayCanvas2D");
    this.overlayCanvas3D = document.getElementById("overlayCanvas3D");

    // Render context handles
    this.renderContext = this.renderCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    this.overlayContext = this.overlayCanvas2D.getContext("2d");

    // State
    this.initialPoints = null;

    // Setup 3D
    this.scene = new THREE.Scene();
    this.camera = null; // TODO: Construct camera here, might not be set in computeDimensions()
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.overlayCanvas3D,
      alpha: true,
    });

    const radius = 1;
    const widthSegments = 8;
    const heightSegments = 8;
    this.geometry = new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments
    );
    this.wireframe = new THREE.WireframeGeometry(this.geometry);
    this.line = new THREE.LineSegments(this.wireframe);
    this.line.position.z = -10;
    this.line.material.depthTest = false;
    this.line.material.opacity = 0.25;
    this.line.material.transparent = true;
    //this.scene.add(this.line); // TODO

    // Reverence given to event handlers
    let self = this;

    // Worker events
    this.motionWorker.onmessage = function (event) {
      const msg = event.data;

      if (msg.error) {
        throw new Error(msg.error);
      }

      switch (msg.type) {
        case "moduleInitialized":
          console.log("Motion tracker worker initialized");
          self.motionWorkerInitialized = true;
          break;

        case "onFrameProcessed":
          const frameInfo = {
            pts: msg.pts,
            sceneScore: msg.sceneScore,
            pointBuffer: msg.pointBuffer,
            pointOffset: msg.pointOffset,
            pointLength: msg.pointLength,
            initialPointBuffer: msg.initialPointBuffer,
            initialPointOffset: msg.initialPointOffset,
            initialPointLength: msg.initialPointLength,
            //projectionMatrix: msg.projectionMatrix,
          };
          resolveFrameProcessed(frameInfo);
          break;

        default:
          console.error("Unkown message type: " + msg.type);
      }
    };
  }

  start(video) {
    this.video = video;

    // Reverence given to event handlers
    let self = this;

    // Window events
    this.window.addEventListener("resize", () => {
      this.computeDimensions();
    });
    this.window.addEventListener("orientationchange", () => {
      this.computeDimensions();
    });

    // Video events
    this.video.addEventListener("loadedmetadata", function () {
      self.computeDimensions();
    });
    this.video.addEventListener(
      "play",
      async function () {
        // Video has started playing, update dimensions
        self.computeDimensions();

        // Show overlay canvas
        const viewOverlayIcon = document.getElementById("viewOverlayIcon");
        const hideOverlayIcon = document.getElementById("hideOverlayIcon");

        if (self.window.showOverlay) {
          viewOverlayIcon.style.display = "none";
          hideOverlayIcon.style.display = "block";
          self.overlayCanvas2D.style.display = "block";
          self.overlayCanvas3D.style.display = "block";
        } else {
          viewOverlayIcon.style.display = "block";
          hideOverlayIcon.style.display = "none";
          self.overlayCanvas2D.style.display = "none";
          self.overlayCanvas3D.style.display = "none";
        }

        // Start animation loop
        function animate() {
          requestAnimationFrame(animate);
          self.renderer.render(self.scene, self.camera);
        }
        animate();

        // Start render loop
        await self.renderLoop();
      },
      false
    );
  }

  doUnload() {
    // TODO: Cleanup worker
  }

  async renderLoop() {
    if (this.video.paused || this.video.ended) {
      return;
    }

    // Render the frame
    await this.renderFrame();

    // Schedule the next frame
    let self = this;
    setTimeout(async function () {
      await self.renderLoop();
    }, 0);
  }

  computeDimensions() {
    // Get the resolution of the video stream
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;

    // Look up the size the browser is displaying the canvas
    const displayWidth = this.video.clientWidth;
    const displayHeight = this.video.clientHeight;

    // Avoid division by zero
    if (
      videoWidth == 0 ||
      videoHeight == 0 ||
      displayWidth == 0 ||
      displayHeight == 0
    ) {
      return false;
    }

    /*
     * Calculate render dimensions
     */

    let renderWidth = videoWidth;
    let renderHeight = videoHeight;

    while (Math.max(renderWidth, renderHeight) > MAX_RENDER_SIZE) {
      renderWidth /= 2;
      renderHeight /= 2;
    }

    /*
     * Update the render dimensions
     */

    // Resize the render canvas
    if (
      this.renderCanvas.width != renderWidth ||
      this.renderCanvas.height != renderHeight
    ) {
      this.renderCanvas.width = renderWidth;
      this.renderCanvas.height = renderHeight;
    }

    // Resize the overlay canvases
    if (
      this.overlayCanvas2D.width != displayWidth ||
      this.overlayCanvas2D.height != displayHeight
    ) {
      this.overlayCanvas2D.width = displayWidth;
      this.overlayCanvas2D.height = displayHeight;

      // Update 3D
      // Camera frustum vertical field of view
      const fov = 75;
      // Camera frustum aspect ratio
      const aspect = displayWidth / displayHeight;
      // Camera frustum near plane
      const near = 0.1;
      // Camera frustum far plane
      const far = 1000;
      this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.camera.position.z = 0;
      this.camera.rotation.x = 0;
      this.camera.rotation.y = 0;
      this.camera.rotation.z = 0;
      //this.camera.matrixAutoUpdate = false;

      this.renderer.setSize(displayWidth, displayHeight);
    }

    return true;
  }

  async renderFrame() {
    if (!this.motionWorkerInitialized) {
      return;
    }

    // Update dimensions before the video is rendered
    if (!this.computeDimensions()) {
      return;
    }

    if (!this.window.showOverlay) {
      return;
    }

    const renderWidth = this.renderCanvas.width;
    const renderHeight = this.renderCanvas.height;

    if (!this.motionWorkerOpen) {
      this.motionWorker.postMessage({
        type: "open",
        videoWidth: renderWidth,
        videoHeight: renderHeight,
      });
      this.motionWorkerOpen = true;
    }

    // Render video to the render canvas
    const { renderPixels, pts } = this.renderVideo(
      this.video,
      renderWidth,
      renderHeight
    );
    if (!renderPixels) {
      return;
    }

    // Hand off render pixels to web worker
    this.frameProcessed = new Promise((resolve, reject) => {
      resolveFrameProcessed = resolve;
    });
    this.motionWorker.postMessage(
      {
        type: "addVideoFrame",
        pts: pts,
        pixelBuffer: renderPixels.data.buffer,
        byteOffset: renderPixels.data.byteOffset,
        byteLength: renderPixels.data.byteLength,
      },
      [renderPixels.data.buffer]
    );
    const frameInfo = await this.frameProcessed;

    const nowMs = performance.now();

    const sceneScore = frameInfo.sceneScore;
    const pointBuffer = frameInfo.pointBuffer;
    const pointOffset = frameInfo.pointOffset;
    const pointLength = frameInfo.pointLength;
    const initialPointBuffer = frameInfo.initialPointBuffer;
    const initialPointOffset = frameInfo.initialPointOffset;
    const initialPointLength = frameInfo.initialPointLength;
    //const projectionMatrixBuffer = frameInfo.projectionMatrixBuffer;

    const points = new Float32Array(pointBuffer, pointOffset, pointLength);
    const initialPoints = new Float32Array(
      initialPointBuffer,
      initialPointOffset,
      initialPointLength
    );
    // TODO
    //const projectionMatrix = new Float32Array(projectionMatrixBuffer);

    let pointCount = `${points.length / 2}`;
    while (pointCount.length < 4) {
      pointCount = " " + pointCount;
    }
    /*
    console.log(
      `Processed frame with ${pointCount} points in ${nowMs - frameInfo.pts} ms`
    );
    */

    // Update dimensions before the overlay is rendered
    this.computeDimensions();

    const overlayWidth = this.overlayCanvas2D.width;
    const overlayHeight = this.overlayCanvas2D.height;

    this.overlayContext.clearRect(0, 0, overlayWidth, overlayHeight);

    for (let i = 0; i < points.length; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      const initialX = initialPoints[i];
      const initialY = initialPoints[i + 1];
      const coords = this.getCoordinates(
        renderWidth,
        renderHeight,
        overlayWidth,
        overlayHeight,
        x,
        y
      );
      const initialCoords = this.getCoordinates(
        renderWidth,
        renderHeight,
        overlayWidth,
        overlayHeight,
        initialX,
        initialY
      );

      if (
        0 <= coords.x &&
        coords.x <= overlayWidth &&
        0 <= coords.y &&
        coords.y <= overlayHeight
      ) {
        this.drawCircle(coords.x, coords.y);

        if (
          0 <= initialCoords.x &&
          initialCoords.x <= overlayWidth &&
          0 <= initialCoords.y &&
          initialCoords.y <= overlayHeight
        ) {
          //this.drawCircle(initialCoords.x, initialCoords.y);
          this.drawLine(initialCoords.x, initialCoords.y, coords.x, coords.y);
        }
      }
    }

    /* TODO
    // Update camera position
    this.camera.rotation.x = 0;
    this.camera.rotation.y = 0;
    this.camera.rotation.z = 0;

    this.camera.updateMatrixWorld(true);
    */
  }

  /*
   * Render the video to an OpenCV image
   */
  renderVideo(video, renderWidth, renderHeight) {
    // Render the video to the render canvas
    this.renderContext.drawImage(video, 0, 0, renderWidth, renderHeight);

    // Get render memory
    const renderPixels = this.renderContext.getImageData(
      0,
      0,
      renderWidth,
      renderHeight
    );

    // "Presentation timestamp", the time the frame was presented
    const pts = performance.now();

    return { renderPixels, pts };
  }

  getCoordinates(renderWidth, renderHeight, overlayWidth, overlayHeight, x, y) {
    // Calculate aspect ratio of the video and the display
    const videoAspect = renderWidth / renderHeight;
    const displayAspect = overlayWidth / overlayHeight;

    let scaleFactor = 1.0;

    let cropX = 0;
    let cropY = 0;

    if (displayAspect < videoAspect) {
      // Display is cropped horizontally, scale by height
      scaleFactor = overlayHeight / renderHeight;

      // Crop X by missing width
      cropX = (renderWidth * scaleFactor - overlayWidth) / 2;
    } else {
      // Display is cropped vertically, scale by width
      scaleFactor = overlayWidth / renderWidth;

      // Crop Y by missing height
      cropY = (renderHeight * scaleFactor - overlayHeight) / 2;
    }

    x *= scaleFactor;
    y *= scaleFactor;

    x -= cropX;
    y -= cropY;

    return { x: x, y: y };
  }

  drawCircle(x, y) {
    this.overlayContext.beginPath();
    this.overlayContext.arc(x, y, 4, 0, 2 * Math.PI, false);
    this.overlayContext.fillStyle = "white";
    this.overlayContext.fill();
    this.overlayContext.lineWidth = 2;
    this.overlayContext.strokeStyle = "#333333";
    this.overlayContext.stroke();
  }

  drawLine(x1, y1, x2, y2) {
    this.overlayContext.beginPath();
    this.overlayContext.moveTo(x1, y1);
    this.overlayContext.lineTo(x2, y2);
    this.overlayContext.lineWidth = 1;
    this.overlayContext.strokeStyle = "rgba(255, 255, 255, 0.65)";
    this.overlayContext.stroke();
  }
}

export { MotionTracker };
