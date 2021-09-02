/*
 * Copyright (C) 2020 Aclima, Inc.
 * This file is part of iot2web - https://github.com/Aclima/iot2web.git
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
    knownEntrypoints: [],
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
