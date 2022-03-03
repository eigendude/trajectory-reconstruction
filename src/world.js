/*
 * Copyright (C) 2019-2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

import jsonld from "jsonld";

import { IPFS_GATEWAY } from "./ipfs";

class World {
  constructor() {
    // World semver is defined here. Bump this when world changes.
    // Major - incompatible with existing APIs
    // Minor - backwards-compatible features and functionality
    // Patch - backwards-compatible fixes
    this.WORLD_VERSION = "1.0.0";

    // World Content Identifier
    this.WORLD_CID = "QmUHi5kmNvVanFJh3EapKHXiDHy8VSi9AatUs6UDkH8odD";

    this.WORLD_URI = `${IPFS_GATEWAY}/ipfs/${this.WORLD_CID}/graph.json`;
  }

  get cid() {
    return this.WORLD_CID;
  }

  get version() {
    return this.WORLD_VERSION;
  }

  async getVideoHlsUri() {
    // Load world
    const response = await fetch(this.WORLD_URI);
    const responseJson = await response.json();

    // Parse JSON-LD. The JSON-LD document looks like:
    //
    //   {
    //     "@context": ...,
    //     "@graph": [
    //       ...
    //     ]
    //   }
    //
    // This is called "compacted form". The graph is a list of JSON-LD
    // objects. An object looks like:
    //
    //   {
    //     "@type": "VideoObject",
    //     "title": {
    //         "en": "Dubai Downtown Panorama"
    //     },
    //     "creator": "Swedrone",
    //     "license": "CC-BY-3.0",
    //     ...
    //  }
    //
    // When the JSON-LD document is expanded, the context is used to
    // reconstruct full URIs for each subject, predicate and object.
    // For the example above, when expanded, it looks like:
    //
    //   {
    //     "@type": [
    //       "http://schema.org/VideoObject"
    //     ],
    //     "http://purl.org/dc/terms/title": [
    //       {
    //         "@language": "en",
    //         "@value": "Dubai Downtown Panorama"
    //       }
    //     ],
    //     "http://purl.org/dc/terms/creator": [
    //       {
    //         "@value": "Swedrone"
    //       }
    //     ],
    //     "http://spdx.org/rdf/terms#licenseId": [
    //       {
    //         "@value": "Swedrone"
    //       }
    //     ],
    //     ...
    //    }
    //
    // When the document is expanded, fields that don't appear in the
    // context are dropped. We can expand the document and recompact,
    // which sanitizes data in the document.

    // Context is retrieved from the "@context" field of the JSON document
    const context = responseJson;

    // Expand the graph, dropping invalid fields
    const expanded = await jsonld.expand(responseJson);

    // Compact the graph, shortening the long URIs to field names for the
    // compacted document
    const compacted = await jsonld.compact(expanded, context);

    // The world is the list of objects in the "@graph" field
    const world = compacted["@graph"];

    // Extract video URIs
    const videos = [];
    for (const index in world) {
      const obj = world[index];
      if (obj["@type"] == "VideoObject") {
        videos.push(obj.mediaStream[0].fileUrl);
      }
    }

    // Index of the the background video from all videos in the world
    const WORLD_VIDEO_INDEX = Math.floor(Math.random() * videos.length);
    //const WORLD_VIDEO_INDEX = 4;

    // Choose a video
    const fileName = videos[WORLD_VIDEO_INDEX];

    const videoUri = `${IPFS_GATEWAY}/ipfs/${this.WORLD_CID}/${fileName}`;

    return videoUri;
  }

  async getVideoMp4Uri() {
    const videoHlsUri = await this.getVideoHlsUri();

    return videoHlsUri.replace("/index.m3u8", ".mp4");
  }
}

export { World };
