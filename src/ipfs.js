/*
 * Copyright (C) 2019-2020 Marquise Stein
 * This file is part of 8bitbot - https://github.com/botocracy/8bitbot
 *
 * SPDX-License-Identifier: Apache-2.0
 * See LICENSE.txt for more information.
 */

// IPFS parameters
const IPFS_GATEWAYS = [
  "https://ipfs.io",
  "https://ipfs.infura.io",
  "https://gateway.ipfs.io",
];

// TODO
//const IPFS_GATEWAY = IPFS_GATEWAYS[Math.floor(Math.random() * IPFS_GATEWAYS.length)];
const IPFS_GATEWAY = IPFS_GATEWAYS[1];

export { IPFS_GATEWAY };
