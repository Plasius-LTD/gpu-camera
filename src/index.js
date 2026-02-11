const EPSILON = 1e-6;
const DEFAULT_VIEWPORT = Object.freeze({
  x: 0,
  y: 0,
  width: 1,
  height: 1,
});

const DEFAULT_UP = Object.freeze([0, 1, 0]);

export const cameraProjectionKinds = Object.freeze([
  "perspective",
  "orthographic",
]);

export const cameraControlKinds = Object.freeze([
  "set-look-at",
  "orbit",
  "pan",
  "truck",
  "dolly",
]);

function nowMs(timeSource) {
  if (typeof timeSource === "function") {
    return Number(timeSource()) || Date.now();
  }
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function cloneVec3(value, fallback = [0, 0, 0]) {
  if (!Array.isArray(value) || value.length < 3) {
    return [...fallback];
  }
  return [
    finiteNumber(value[0], fallback[0]),
    finiteNumber(value[1], fallback[1]),
    finiteNumber(value[2], fallback[2]),
  ];
}

function addVec3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function subVec3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scaleVec3(vector, scalar) {
  return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

function dotVec3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function crossVec3(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function lengthVec3(vector) {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

function normalizeVec3(vector, fallback = [0, 0, 1]) {
  const length = lengthVec3(vector);
  if (length <= EPSILON) {
    return [...fallback];
  }
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function cloneViewport(viewport = DEFAULT_VIEWPORT) {
  return {
    x: clamp(finiteNumber(viewport.x, DEFAULT_VIEWPORT.x), 0, 1),
    y: clamp(finiteNumber(viewport.y, DEFAULT_VIEWPORT.y), 0, 1),
    width: clamp(finiteNumber(viewport.width, DEFAULT_VIEWPORT.width), EPSILON, 1),
    height: clamp(finiteNumber(viewport.height, DEFAULT_VIEWPORT.height), EPSILON, 1),
  };
}

function normalizeProjection(projection = {}) {
  const kind = cameraProjectionKinds.includes(projection.kind)
    ? projection.kind
    : "perspective";

  if (kind === "orthographic") {
    const left = finiteNumber(projection.left, -1);
    const right = finiteNumber(projection.right, 1);
    const bottom = finiteNumber(projection.bottom, -1);
    const top = finiteNumber(projection.top, 1);
    const near = Math.max(EPSILON, finiteNumber(projection.near, 0.1));
    const far = Math.max(near + EPSILON, finiteNumber(projection.far, 2000));
    return {
      kind,
      left,
      right,
      bottom,
      top,
      near,
      far,
      aspect: finiteNumber(projection.aspect, 1),
    };
  }

  const fovY = clamp(finiteNumber(projection.fovY, 60), 1, 179);
  const near = Math.max(EPSILON, finiteNumber(projection.near, 0.1));
  const far = Math.max(near + EPSILON, finiteNumber(projection.far, 2000));
  const aspect = Math.max(EPSILON, finiteNumber(projection.aspect, 1));
  return {
    kind,
    fovY,
    near,
    far,
    aspect,
  };
}

function normalizeTransform(transform = {}) {
  const position = cloneVec3(transform.position, [0, 0, 5]);
  const target = cloneVec3(transform.target, [0, 0, 0]);
  const up = normalizeVec3(cloneVec3(transform.up, DEFAULT_UP), DEFAULT_UP);
  return {
    position,
    target,
    up,
  };
}

function cloneCamera(camera) {
  return {
    id: camera.id,
    enabled: camera.enabled,
    priority: camera.priority,
    revision: camera.revision,
    touchedAt: camera.touchedAt,
    viewport: cloneViewport(camera.viewport),
    transform: normalizeTransform(camera.transform),
    projection: normalizeProjection(camera.projection),
    metadata: camera.metadata ? { ...camera.metadata } : undefined,
  };
}

function assertCameraId(cameras, cameraId) {
  const camera = cameras.get(cameraId);
  if (!camera) {
    throw new Error(`Unknown camera "${cameraId}".`);
  }
  return camera;
}

function sortedCameras(cameras) {
  return [...cameras].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.id.localeCompare(b.id);
  });
}

function promoteActive(cameras, activeCameraId) {
  if (!activeCameraId) {
    return cameras;
  }
  const index = cameras.findIndex((camera) => camera.id === activeCameraId);
  if (index <= 0) {
    return cameras;
  }
  const promoted = [...cameras];
  const [active] = promoted.splice(index, 1);
  promoted.unshift(active);
  return promoted;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildPerspectiveMatrix(projection, overrideAspect) {
  const aspect = Math.max(EPSILON, finiteNumber(overrideAspect, projection.aspect));
  const fovRad = (projection.fovY * Math.PI) / 180;
  const f = 1 / Math.tan(fovRad / 2);
  const near = projection.near;
  const far = projection.far;

  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ]);
}

function buildOrthographicMatrix(projection, overrideAspect) {
  const near = projection.near;
  const far = projection.far;
  const aspect = Math.max(EPSILON, finiteNumber(overrideAspect, projection.aspect || 1));

  let left = projection.left;
  let right = projection.right;
  let top = projection.top;
  let bottom = projection.bottom;

  if (finiteNumber(projection.aspect, 0) > EPSILON) {
    const scale = aspect / projection.aspect;
    left *= scale;
    right *= scale;
  }

  const width = Math.max(EPSILON, right - left);
  const height = Math.max(EPSILON, top - bottom);
  const depth = Math.max(EPSILON, far - near);

  return new Float32Array([
    2 / width,
    0,
    0,
    0,
    0,
    2 / height,
    0,
    0,
    0,
    0,
    -2 / depth,
    0,
    -(right + left) / width,
    -(top + bottom) / height,
    -(far + near) / depth,
    1,
  ]);
}

export function buildProjectionMatrix(camera, overrideAspect) {
  const projection = normalizeProjection(camera?.projection);
  if (projection.kind === "orthographic") {
    return buildOrthographicMatrix(projection, overrideAspect);
  }
  return buildPerspectiveMatrix(projection, overrideAspect);
}

export function buildViewMatrix(camera) {
  const transform = normalizeTransform(camera?.transform);
  const eye = transform.position;
  const target = transform.target;
  const up = normalizeVec3(transform.up, DEFAULT_UP);

  let zAxis = normalizeVec3(subVec3(eye, target), [0, 0, 1]);
  let xAxis = normalizeVec3(crossVec3(up, zAxis), [1, 0, 0]);
  let yAxis = crossVec3(zAxis, xAxis);

  if (lengthVec3(xAxis) <= EPSILON) {
    zAxis = [0, 0, 1];
    xAxis = [1, 0, 0];
    yAxis = [0, 1, 0];
  }

  return new Float32Array([
    xAxis[0],
    yAxis[0],
    zAxis[0],
    0,
    xAxis[1],
    yAxis[1],
    zAxis[1],
    0,
    xAxis[2],
    yAxis[2],
    zAxis[2],
    0,
    -dotVec3(xAxis, eye),
    -dotVec3(yAxis, eye),
    -dotVec3(zAxis, eye),
    1,
  ]);
}

export function toCameraUniform(camera, overrideAspect) {
  const normalized = {
    transform: normalizeTransform(camera?.transform),
    projection: normalizeProjection(camera?.projection),
  };

  return {
    id: String(camera?.id ?? ""),
    viewMatrix: buildViewMatrix(normalized),
    projectionMatrix: buildProjectionMatrix(normalized, overrideAspect),
    position: new Float32Array(normalized.transform.position),
    target: new Float32Array(normalized.transform.target),
    near: normalized.projection.near,
    far: normalized.projection.far,
    projectionKind: normalized.projection.kind,
  };
}

function normalizeCameraDefinition(definition, generatedId) {
  const id = String(definition?.id ?? generatedId ?? "camera").trim();
  if (!id) {
    throw new Error("Camera id cannot be empty.");
  }

  return {
    id,
    enabled: definition?.enabled !== false,
    priority: finiteNumber(definition?.priority, 0),
    revision: Math.max(0, Math.floor(finiteNumber(definition?.revision, 0))),
    touchedAt: finiteNumber(definition?.touchedAt, 0),
    viewport: cloneViewport(definition?.viewport),
    transform: normalizeTransform(definition?.transform),
    projection: normalizeProjection(definition?.projection),
    metadata: definition?.metadata
      ? { ...definition.metadata }
      : undefined,
  };
}

export function applyCameraControl(camera, control, options = {}) {
  const base = normalizeCameraDefinition(camera, camera?.id ?? "camera");
  if (!control || typeof control !== "object") {
    return base;
  }

  const kind = String(control.type || "").trim();
  if (!cameraControlKinds.includes(kind)) {
    throw new Error(`Unknown camera control "${kind}".`);
  }

  const minDistance = Math.max(EPSILON, finiteNumber(options.minDistance, 0.05));
  const maxDistance = Math.max(minDistance + EPSILON, finiteNumber(options.maxDistance, 100000));
  const minPolarAngle = clamp(
    finiteNumber(options.minPolarAngle, EPSILON),
    EPSILON,
    Math.PI - EPSILON
  );
  const maxPolarAngle = clamp(
    finiteNumber(options.maxPolarAngle, Math.PI - EPSILON),
    minPolarAngle,
    Math.PI - EPSILON
  );

  let next = cloneCamera(base);

  if (kind === "set-look-at") {
    next.transform.position = cloneVec3(control.position, next.transform.position);
    next.transform.target = cloneVec3(control.target, next.transform.target);
    next.transform.up = normalizeVec3(cloneVec3(control.up, next.transform.up), DEFAULT_UP);
  }

  if (kind === "pan" || kind === "truck") {
    const delta = cloneVec3(control.delta, [0, 0, 0]);
    next.transform.position = addVec3(next.transform.position, delta);
    next.transform.target = addVec3(next.transform.target, delta);
  }

  if (kind === "dolly") {
    const distance = finiteNumber(control.distance, 0);
    const eye = next.transform.position;
    const target = next.transform.target;
    const direction = normalizeVec3(subVec3(target, eye), [0, 0, -1]);

    const offset = subVec3(eye, target);
    const currentRadius = Math.max(EPSILON, lengthVec3(offset));
    const nextRadius = clamp(currentRadius - distance, minDistance, maxDistance);
    const moved = subVec3(target, scaleVec3(direction, nextRadius));
    next.transform.position = moved;
  }

  if (kind === "orbit") {
    const deltaAzimuth = finiteNumber(control.deltaAzimuth, 0);
    const deltaPolar = finiteNumber(control.deltaPolar, 0);
    const radiusDelta = finiteNumber(control.radiusDelta, 0);

    const eye = next.transform.position;
    const target = next.transform.target;
    const offset = subVec3(eye, target);

    const radius = Math.max(EPSILON, lengthVec3(offset));
    const nextRadius = clamp(radius + radiusDelta, minDistance, maxDistance);

    const azimuth = Math.atan2(offset[0], offset[2]) + deltaAzimuth;
    const polarCurrent = Math.acos(clamp(offset[1] / radius, -1, 1));
    const polar = clamp(
      polarCurrent + deltaPolar,
      minPolarAngle,
      maxPolarAngle
    );

    const sinPolar = Math.sin(polar);
    const position = [
      target[0] + nextRadius * sinPolar * Math.sin(azimuth),
      target[1] + nextRadius * Math.cos(polar),
      target[2] + nextRadius * sinPolar * Math.cos(azimuth),
    ];

    next.transform.position = position;
  }

  next.revision = Math.max(base.revision + 1, next.revision);
  next.touchedAt = finiteNumber(options.touchedAt, base.touchedAt);
  return next;
}

export function createRenderPlan(snapshot, options = {}) {
  const mode = options.mode === "multiview" ? "multiview" : "single";
  const enabledOnly = options.enabledOnly !== false;
  const includeMatrices = options.includeMatrices !== false;
  const maxParallelViews = Math.max(
    1,
    Math.floor(
      finiteNumber(
        options.maxParallelViews,
        finiteNumber(snapshot?.maxParallelViews, 1)
      )
    )
  );

  const byId = new Map();
  const inputCameras = ensureArray(snapshot?.cameras).map((camera) =>
    normalizeCameraDefinition(camera, camera?.id)
  );

  for (const camera of inputCameras) {
    byId.set(camera.id, camera);
  }

  let selected;
  if (Array.isArray(options.cameraIds) && options.cameraIds.length > 0) {
    selected = options.cameraIds
      .map((cameraId) => byId.get(String(cameraId)))
      .filter(Boolean);
  } else {
    selected = sortedCameras(inputCameras);
  }

  if (enabledOnly) {
    selected = selected.filter((camera) => camera.enabled);
  }

  selected = promoteActive(selected, snapshot?.activeCameraId ?? null);

  if (mode === "single") {
    selected = selected.slice(0, 1);
  }

  const hotSet = new Set(ensureArray(snapshot?.hotCameraIds).map((id) => String(id)));

  const batches = [];
  for (let index = 0; index < selected.length; index += maxParallelViews) {
    const chunk = selected.slice(index, index + maxParallelViews);
    batches.push({
      index: batches.length,
      parallel: chunk.length > 1,
      views: chunk.map((camera, order) => {
        const aspect = camera.viewport.width / camera.viewport.height;
        const view = {
          cameraId: camera.id,
          order,
          priority: camera.priority,
          revision: camera.revision,
          hot: hotSet.has(camera.id),
          viewport: cloneViewport(camera.viewport),
        };

        if (includeMatrices) {
          view.viewMatrix = buildViewMatrix(camera);
          view.projectionMatrix = buildProjectionMatrix(camera, aspect);
        }

        return view;
      }),
    });
  }

  return {
    mode,
    generatedAt: finiteNumber(options.generatedAt, Date.now()),
    activeCameraId: snapshot?.activeCameraId ?? null,
    hotCameraIds: [...hotSet],
    maxParallelViews,
    totalViews: selected.length,
    canRenderInParallel: mode === "multiview" && batches.some((batch) => batch.parallel),
    batches,
  };
}

export function createCameraManager(options = {}) {
  const listeners = new Set();
  const cameras = new Map();

  const maxParallelViews = Math.max(1, Math.floor(finiteNumber(options.maxParallelViews, 2)));
  const maxHotCameras = Math.max(1, Math.floor(finiteNumber(options.maxHotCameras, 3)));
  const timeSource = options.timeSource;

  let sequence = 0;
  let activeCameraId = null;
  let version = 0;
  let hotCameraIds = [];
  let updatedAt = nowMs(timeSource);

  function bumpVersion() {
    version += 1;
    updatedAt = nowMs(timeSource);
    const snapshot = getSnapshot();
    for (const listener of listeners) {
      listener(snapshot);
    }
  }

  function markHot(cameraId) {
    hotCameraIds = [cameraId, ...hotCameraIds.filter((id) => id !== cameraId)].slice(
      0,
      maxHotCameras
    );
  }

  function selectFallbackActive() {
    const enabled = sortedCameras([...cameras.values()]).filter((camera) => camera.enabled);
    if (enabled.length > 0) {
      return enabled[0].id;
    }
    const sorted = sortedCameras([...cameras.values()]);
    return sorted.length > 0 ? sorted[0].id : null;
  }

  function getSnapshot() {
    const snapshot = {
      activeCameraId,
      version,
      updatedAt,
      maxParallelViews,
      maxHotCameras,
      hotCameraIds: [...hotCameraIds],
      cameras: sortedCameras([...cameras.values()]).map((camera) => cloneCamera(camera)),
    };
    return snapshot;
  }

  function registerCamera(definition = {}) {
    sequence += 1;
    const generatedId = `camera-${sequence}`;
    const camera = normalizeCameraDefinition(definition, generatedId);

    if (cameras.has(camera.id)) {
      throw new Error(`Camera "${camera.id}" is already registered.`);
    }

    camera.touchedAt = nowMs(timeSource);
    cameras.set(camera.id, camera);

    if (!activeCameraId) {
      activeCameraId = camera.id;
    }

    markHot(camera.id);
    bumpVersion();
    return cloneCamera(camera);
  }

  function updateCamera(cameraId, patch = {}) {
    const current = assertCameraId(cameras, cameraId);
    const next = normalizeCameraDefinition(
      {
        ...current,
        ...patch,
        id: current.id,
        transform: {
          ...current.transform,
          ...patch.transform,
        },
        projection: {
          ...current.projection,
          ...patch.projection,
        },
        viewport: {
          ...current.viewport,
          ...patch.viewport,
        },
      },
      current.id
    );

    next.revision = current.revision + 1;
    next.touchedAt = nowMs(timeSource);

    cameras.set(current.id, next);
    markHot(current.id);

    if (patch.makeActive === true) {
      activeCameraId = current.id;
    }

    bumpVersion();
    return cloneCamera(next);
  }

  function upsertCamera(definition = {}) {
    if (definition?.id && cameras.has(definition.id)) {
      return updateCamera(definition.id, definition);
    }
    return registerCamera(definition);
  }

  function removeCamera(cameraId) {
    if (!cameras.has(cameraId)) {
      return false;
    }

    cameras.delete(cameraId);
    hotCameraIds = hotCameraIds.filter((id) => id !== cameraId);

    if (activeCameraId === cameraId) {
      activeCameraId = selectFallbackActive();
    }

    bumpVersion();
    return true;
  }

  function activateCamera(cameraId) {
    const current = assertCameraId(cameras, cameraId);
    activeCameraId = current.id;

    const updated = cloneCamera(current);
    updated.touchedAt = nowMs(timeSource);
    cameras.set(current.id, updated);

    markHot(current.id);
    bumpVersion();
    return cloneCamera(updated);
  }

  function listCameras(listOptions = {}) {
    let next = sortedCameras([...cameras.values()]);
    if (listOptions.enabledOnly) {
      next = next.filter((camera) => camera.enabled);
    }
    return next.map((camera) => cloneCamera(camera));
  }

  function switchCamera(direction = 1, switchOptions = {}) {
    let list = sortedCameras([...cameras.values()]);
    if (switchOptions.enabledOnly !== false) {
      list = list.filter((camera) => camera.enabled);
    }

    if (list.length === 0) {
      return null;
    }

    const currentIndex = list.findIndex((camera) => camera.id === activeCameraId);
    const step = direction >= 0 ? 1 : -1;
    const nextIndex =
      currentIndex < 0
        ? 0
        : (currentIndex + step + list.length) % list.length;

    return activateCamera(list[nextIndex].id);
  }

  function applyControl(cameraId, control, controlOptions = {}) {
    const current = assertCameraId(cameras, cameraId);
    const touchedAt = nowMs(timeSource);
    const next = applyCameraControl(current, control, {
      ...controlOptions,
      touchedAt,
    });

    cameras.set(cameraId, next);
    markHot(cameraId);

    if (controlOptions.makeActive === true) {
      activeCameraId = cameraId;
    }

    bumpVersion();
    return cloneCamera(next);
  }

  function getCamera(cameraId) {
    const camera = cameras.get(cameraId);
    return camera ? cloneCamera(camera) : null;
  }

  function hasCamera(cameraId) {
    return cameras.has(cameraId);
  }

  function createPlan(planOptions = {}) {
    return createRenderPlan(getSnapshot(), {
      ...planOptions,
      maxParallelViews:
        planOptions.maxParallelViews ?? maxParallelViews,
      generatedAt: nowMs(timeSource),
    });
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error("Listener must be a function.");
    }
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function clear() {
    cameras.clear();
    activeCameraId = null;
    hotCameraIds = [];
    bumpVersion();
  }

  return {
    registerCamera,
    updateCamera,
    upsertCamera,
    removeCamera,
    activateCamera,
    switchCamera,
    applyControl,
    hasCamera,
    getCamera,
    listCameras,
    getSnapshot,
    createRenderPlan: createPlan,
    subscribe,
    clear,
  };
}
