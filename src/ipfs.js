/*
 * Copyright (C) 2019-2020 Garrett Brown
 * This file is part of trajectory-reconstruction - https://github.com/eigendude/trajectory-reconstruction
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

// IPFS parameters
const IPFS_GATEWAYS = ["https://ipfs.io", "https://gateway.ipfs.io"];

// TODO
const IPFS_GATEWAY =
  IPFS_GATEWAYS[Math.floor(Math.random() * IPFS_GATEWAYS.length)];

export { IPFS_GATEWAY };
