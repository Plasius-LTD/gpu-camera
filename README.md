# @plasius/gpu-camera

[![npm version](https://img.shields.io/npm/v/@plasius/gpu-camera.svg)](https://www.npmjs.com/package/@plasius/gpu-camera)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Plasius-LTD/gpu-camera/ci.yml?branch=main&label=build&style=flat)](https://github.com/Plasius-LTD/gpu-camera/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/Plasius-LTD/gpu-camera)](https://codecov.io/gh/Plasius-LTD/gpu-camera)
[![License](https://img.shields.io/github/license/Plasius-LTD/gpu-camera)](./LICENSE)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-yes-blue.svg)](./CODE_OF_CONDUCT.md)
[![Security Policy](https://img.shields.io/badge/security%20policy-yes-orange.svg)](./SECURITY.md)
[![Changelog](https://img.shields.io/badge/changelog-md-blue.svg)](./CHANGELOG.md)

[![license](https://img.shields.io/github/license/Plasius-LTD/gpu-camera)](./LICENSE)

Framework-agnostic multi-camera runtime for Plasius GPU projects.

`@plasius/gpu-camera` is the replacement track for `camera-controls` usage. It
provides deterministic camera orchestration with:

- camera registration and lifecycle,
- low-latency active camera switching,
- parallel multiview render planning,
- control primitives (orbit/pan/dolly) that do not depend on Three.js.

Apache-2.0. ESM + CJS builds.

## Install

```sh
npm install @plasius/gpu-camera
```

## Usage

```js
import { createCameraManager } from "@plasius/gpu-camera";

const cameras = createCameraManager({
  maxParallelViews: 2,
  maxHotCameras: 3,
});

cameras.registerCamera({
  id: "main",
  priority: 100,
  transform: {
    position: [0, 3, 8],
    target: [0, 0, 0],
    up: [0, 1, 0],
  },
  projection: {
    kind: "perspective",
    fovY: 60,
    near: 0.1,
    far: 2000,
    aspect: 16 / 9,
  },
});

cameras.registerCamera({
  id: "map",
  priority: 50,
  transform: {
    position: [0, 40, 0],
    target: [0, 0, 0],
    up: [0, 0, -1],
  },
  projection: {
    kind: "orthographic",
    left: -50,
    right: 50,
    top: 50,
    bottom: -50,
    near: 0.1,
    far: 1000,
  },
  viewport: { x: 0.72, y: 0.72, width: 0.26, height: 0.26 },
});

cameras.activateCamera("main");

// build a parallel render plan for multi-view
const plan = cameras.createRenderPlan({ mode: "multiview" });
```

## API

- `createCameraManager(options)`
- `applyCameraControl(camera, control)`
- `createRenderPlan(snapshot, options)`
- `buildViewMatrix(camera)`
- `buildProjectionMatrix(camera, overrideAspect)`
- `toCameraUniform(camera, overrideAspect)`

## Demo

Run the demo server from repo root:

```sh
cd gpu-camera
npm run demo
```

Then open `http://localhost:8000/gpu-camera/demo/`.

## Files

- `src/index.js`: camera manager, controls, matrix/uniform helpers, render planner.
- `tests/package.test.js`: unit tests for multiview and fast-switch behavior.
- `docs/adrs/*`: architectural decisions for camera runtime design.
