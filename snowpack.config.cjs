/*
 * Copyright (C) 2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

/* eslint @typescript-eslint/no-var-requires: "off" */

const globals = require("rollup-plugin-node-globals");
const polyfills = require("rollup-plugin-node-polyfills");
const resolve = require("@rollup/plugin-node-resolve").nodeResolve;

module.exports = {
  mount: {
    // Mount "public" to the root URL path ("/#") and serve files with zero
    // transformations
    public: {
      url: "/",
      static: true,
      resolve: false,
    },
    // Source directory
    src: {
      url: "/_dist_",
    },
    // C++ library directory
    lib: {
      url: "/lib",
    },
  },
  devOptions: {
    bundle: false,
  },
  buildOptions: {
    minify: false,
  },
  plugins: ["@snowpack/plugin-typescript"],
  optimize: {
    treeshake: true,
  },
  packageOptions: {
    sourceMap: true,
    knownEntrypoints: ["three"],
    rollup: {
      plugins: [
        // Fix "Uncaught TypeError: bufferEs6.hasOwnProperty is not a function"
        resolve({
          preferBuiltins: false,
        }),
        globals(),
        polyfills(),
      ],
    },
  },
};
