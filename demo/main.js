import { createCameraManager } from "../dist/index.js";
import { mountGpuShowcase } from "@plasius/gpu-shared";

const root = globalThis.document?.getElementById("app");
if (!root) {
  throw new Error("Camera demo root element was not found.");
}

function registerCamera(manager, camera) {
  manager.registerCamera(camera);
}

function createState() {
  const manager = createCameraManager({
    maxParallelViews: 2,
    maxHotCameras: 3,
  });

  registerCamera(manager, {
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

  registerCamera(manager, {
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
      aspect: 1,
    },
    viewport: { x: 0.72, y: 0.72, width: 0.26, height: 0.26 },
  });

  registerCamera(manager, {
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

  return {
    activeCameraId: "main",
    manager,
  };
}

function updateState(state, scene) {
  const sequence = ["main", "rear", "map"];
  const nextId = sequence[Math.floor(scene.time / 4) % sequence.length];
  if (state.activeCameraId !== nextId) {
    state.manager.activateCamera(nextId);
    state.activeCameraId = nextId;
  }
  return state;
}

function describeState(state, scene) {
  const snapshot = state.manager.getSnapshot();
  const singlePlan = state.manager.createRenderPlan({ mode: "single" });
  const multiviewPlan = state.manager.createRenderPlan({ mode: "multiview" });

  return {
    status: `Camera live · ${snapshot.activeCameraId} active`,
    details:
      "The shared harbor scene stays mounted while gpu-camera changes the active view, hot camera set, and multiview batches over time.",
    sceneMetrics: [
      `active camera: ${snapshot.activeCameraId}`,
      `registered cameras: ${snapshot.cameras.length}`,
      `hot cameras: ${snapshot.hotCameraIds.join(", ")}`,
      `parallel views: ${snapshot.maxParallelViews}`,
    ],
    qualityMetrics: [
      `single-view batches: ${singlePlan.batches.length}`,
      `multiview batches: ${multiviewPlan.batches.length}`,
      `multiview total views: ${multiviewPlan.totalViews}`,
      `map viewport: ${snapshot.cameras.find((camera) => camera.id === "map")?.viewport?.width ?? 0} width`,
    ],
    debugMetrics: [
      `scene ships: ${scene.ships.length}`,
      `stress mode: ${scene.stress ? "on" : "off"}`,
      `collisions: ${scene.collisions}`,
      `render-plan mode: ${snapshot.activeCameraId === "map" ? "overview" : "hero"}`,
    ],
    notes: [
      "The 3D surface comes from the shared gpu-shared harbor runtime, not a package-local renderer copy.",
      "gpu-camera remains responsible for active-view choice, camera priority, and multiview planning.",
      "The active camera rotates through hero, rear, and map views so the scene proves those transitions on a live 3D surface.",
    ],
    textState: {
      activeCameraId: snapshot.activeCameraId,
      hotCameraIds: snapshot.hotCameraIds,
      multiviewBatches: multiviewPlan.batches.length,
    },
    visuals: {
      flagMotion: snapshot.activeCameraId === "map" ? 0.46 : 0.58,
      reflectionStrength: snapshot.activeCameraId === "rear" ? 0.2 : 0.14,
      shadowAccent: snapshot.activeCameraId === "main" ? 0.08 : 0.05,
      waveAmplitude: snapshot.activeCameraId === "map" ? 0.82 : 0.68,
    },
  };
}

await mountGpuShowcase({
  root,
  packageName: "@plasius/gpu-camera",
  title: "Multi-Camera Harbor Validation",
  subtitle:
    "A shared 3D harbor surface driven by gpu-camera view selection, hot camera promotion, and multiview planning.",
  createState,
  updateState,
  describeState,
});
