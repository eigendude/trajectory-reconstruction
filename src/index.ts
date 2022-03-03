/*
 * Copyright (C) 2022 Team Kodi
 * This file is part of kodi-connect - https://github.com/kodi-game/kodi-connect
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 * See LICENSE.txt for more information.
 */

// Fix error:
//
//   [@snowpack/plugin-typescript] src/index.ts(13,1): error TS1208: 'index.ts'
//   cannot be compiled under '--isolatedModules' because it is considered a
//   global script file. Add an import, export, or an empty 'export {}'
//   statement to make it a module.
export {};
