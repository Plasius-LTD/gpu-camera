import { createCameraManager } from "../src/index.js";

const output = document.querySelector("#output");
const switchButton = document.querySelector("#switch");
const multiviewButton = document.querySelector("#multiview");
const displayBadge = document.querySelector("#displayBadge");
const displayDetails = document.querySelector("#displayDetails");

const manager = createCameraManager({
  maxParallelViews: 2,
  maxHotCameras: 3,
});

manager.registerCamera({
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
    far: 1500,
    aspect: 16 / 9,
  },
});

manager.registerCamera({
  id: "map",
  priority: 40,
  transform: {
    position: [0, 35, 0],
    target: [0, 0, 0],
    up: [0, 0, -1],
  },
  projection: {
    kind: "orthographic",
    left: -40,
    right: 40,
    top: 40,
    bottom: -40,
    near: 0.1,
    far: 200,
  },
  viewport: { x: 0.72, y: 0.72, width: 0.26, height: 0.26 },
});

manager.registerCamera({
  id: "rear",
  priority: 80,
  transform: {
    position: [0, 2, -7],
    target: [0, 0, 0],
    up: [0, 1, 0],
  },
  projection: {
    kind: "perspective",
    fovY: 70,
    near: 0.1,
    far: 1000,
    aspect: 16 / 9,
  },
});

function serializePlan(plan) {
  return {
    ...plan,
    batches: plan.batches.map((batch) => ({
      ...batch,
      views: batch.views.map((view) => ({
        ...view,
        viewMatrix: view.viewMatrix ? "Float32Array(16)" : undefined,
        projectionMatrix: view.projectionMatrix ? "Float32Array(16)" : undefined,
      })),
    })),
  };
}

function setDisplayState(badge, details) {
  if (displayBadge) {
    displayBadge.textContent = badge;
  }
  if (displayDetails) {
    displayDetails.textContent = details;
  }
}

function render() {
  const snapshot = manager.getSnapshot();
  const singlePlan = manager.createRenderPlan({ mode: "single" });

  setDisplayState(
    "State-only demo",
    `No 3D canvas is mounted here. Active camera: ${snapshot.activeCameraId}. ` +
      `This demo shows camera registration and render-plan state only.`
  );

  output.textContent = JSON.stringify(
    {
      activeCameraId: snapshot.activeCameraId,
      hotCameraIds: snapshot.hotCameraIds,
      cameras: snapshot.cameras.map((camera) => ({
        id: camera.id,
        priority: camera.priority,
        enabled: camera.enabled,
        viewport: camera.viewport,
      })),
      singlePlan: serializePlan(singlePlan),
    },
    null,
    2
  );
}

switchButton.addEventListener("click", () => {
  manager.switchCamera(1);
  render();
});

multiviewButton.addEventListener("click", () => {
  const plan = manager.createRenderPlan({ mode: "multiview" });
  setDisplayState(
    "State-only demo",
    `No 3D canvas is mounted here. Multiview plan prepared with ${plan.batches.length} batch(es).`
  );
  output.textContent = JSON.stringify(serializePlan(plan), null, 2);
});

render();
