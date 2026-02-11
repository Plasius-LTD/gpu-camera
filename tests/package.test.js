import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyCameraControl,
  buildProjectionMatrix,
  buildViewMatrix,
  cameraControlKinds,
  cameraProjectionKinds,
  createCameraManager,
  createRenderPlan,
  toCameraUniform,
} from "../src/index.js";

function approxEqual(actual, expected, epsilon = 1e-4) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `Expected ${actual} ~= ${expected}`);
}

test("exports projection and control kinds", () => {
  assert.deepEqual(cameraProjectionKinds, ["perspective", "orthographic"]);
  assert.deepEqual(cameraControlKinds, [
    "set-look-at",
    "orbit",
    "pan",
    "truck",
    "dolly",
  ]);
});

test("camera manager supports multi-camera registration and active switching", () => {
  const manager = createCameraManager({ maxParallelViews: 2, maxHotCameras: 2 });

  manager.registerCamera({
    id: "main",
    priority: 100,
    transform: { position: [0, 3, 8], target: [0, 0, 0] },
    projection: { kind: "perspective", fovY: 60, near: 0.1, far: 1500, aspect: 16 / 9 },
  });

  manager.registerCamera({
    id: "map",
    priority: 20,
    transform: { position: [0, 40, 0], target: [0, 0, 0], up: [0, 0, -1] },
    projection: { kind: "orthographic", left: -30, right: 30, top: 30, bottom: -30, near: 0.1, far: 300 },
    viewport: { x: 0.75, y: 0.75, width: 0.25, height: 0.25 },
  });

  manager.registerCamera({
    id: "rear",
    priority: 80,
    transform: { position: [0, 2, -6], target: [0, 0, 0] },
    projection: { kind: "perspective", fovY: 70, near: 0.1, far: 1000, aspect: 16 / 9 },
  });

  manager.activateCamera("map");

  const plan = manager.createRenderPlan({ mode: "multiview" });
  assert.equal(plan.mode, "multiview");
  assert.equal(plan.totalViews, 3);
  assert.equal(plan.batches.length, 2);
  assert.equal(plan.batches[0].parallel, true);
  assert.equal(plan.batches[0].views[0].cameraId, "map");
  assert.equal(plan.batches[0].views[1].cameraId, "main");

  const switched = manager.switchCamera(1);
  assert.equal(switched?.id, "main");
  assert.equal(manager.getSnapshot().activeCameraId, "main");
  assert.deepEqual(manager.getSnapshot().hotCameraIds, ["main", "map"]);
});

test("applyCameraControl supports orbit, dolly, and pan", () => {
  const baseCamera = {
    id: "c1",
    transform: {
      position: [0, 0, 10],
      target: [0, 0, 0],
      up: [0, 1, 0],
    },
    projection: {
      kind: "perspective",
      fovY: 60,
      near: 0.1,
      far: 1000,
      aspect: 1,
    },
  };

  const orbited = applyCameraControl(baseCamera, {
    type: "orbit",
    deltaAzimuth: Math.PI / 2,
    deltaPolar: 0,
  });

  approxEqual(orbited.transform.position[0], 10);
  approxEqual(orbited.transform.position[1], 0);
  approxEqual(orbited.transform.position[2], 0);

  const dollied = applyCameraControl(orbited, {
    type: "dolly",
    distance: 2,
  });

  approxEqual(dollied.transform.position[0], 8);
  approxEqual(dollied.transform.position[2], 0);

  const panned = applyCameraControl(dollied, {
    type: "pan",
    delta: [0, 1, 0],
  });

  approxEqual(panned.transform.position[1], 1);
  approxEqual(panned.transform.target[1], 1);
});

test("matrix helpers and uniform generation produce expected outputs", () => {
  const camera = {
    id: "main",
    transform: {
      position: [0, 0, 10],
      target: [0, 0, 0],
      up: [0, 1, 0],
    },
    projection: {
      kind: "perspective",
      fovY: 60,
      near: 0.1,
      far: 100,
      aspect: 2,
    },
  };

  const view = buildViewMatrix(camera);
  const projection = buildProjectionMatrix(camera);
  const uniform = toCameraUniform(camera);

  assert.equal(view.length, 16);
  assert.equal(projection.length, 16);
  assert.equal(uniform.viewMatrix.length, 16);
  assert.equal(uniform.projectionMatrix.length, 16);
  approxEqual(view[14], -10);
  assert.ok(projection[0] < projection[5]);
});

test("standalone render plan supports explicit cameraIds selection", () => {
  const snapshot = {
    activeCameraId: "b",
    maxParallelViews: 2,
    hotCameraIds: ["c", "b"],
    cameras: [
      {
        id: "a",
        enabled: true,
        priority: 10,
        revision: 2,
        touchedAt: 1,
        viewport: { x: 0, y: 0, width: 1, height: 1 },
        transform: { position: [0, 0, 10], target: [0, 0, 0], up: [0, 1, 0] },
        projection: { kind: "perspective", fovY: 50, near: 0.1, far: 1000, aspect: 1 },
      },
      {
        id: "b",
        enabled: true,
        priority: 20,
        revision: 3,
        touchedAt: 2,
        viewport: { x: 0, y: 0, width: 0.5, height: 1 },
        transform: { position: [2, 2, 8], target: [0, 0, 0], up: [0, 1, 0] },
        projection: { kind: "perspective", fovY: 60, near: 0.1, far: 1000, aspect: 1 },
      },
      {
        id: "c",
        enabled: true,
        priority: 5,
        revision: 1,
        touchedAt: 3,
        viewport: { x: 0.5, y: 0, width: 0.5, height: 1 },
        transform: { position: [0, 5, 0], target: [0, 0, 0], up: [0, 0, -1] },
        projection: { kind: "orthographic", left: -10, right: 10, top: 10, bottom: -10, near: 0.1, far: 100 },
      },
    ],
  };

  const plan = createRenderPlan(snapshot, {
    mode: "multiview",
    cameraIds: ["c", "b"],
    includeMatrices: false,
  });

  assert.equal(plan.totalViews, 2);
  assert.equal(plan.batches.length, 1);
  assert.equal(plan.batches[0].views[0].cameraId, "b");
  assert.equal(plan.batches[0].views[1].cameraId, "c");
  assert.equal(plan.batches[0].views[0].hot, true);
  assert.equal(plan.batches[0].views[0].viewMatrix, undefined);
});
