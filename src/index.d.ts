export type Vec3 = [number, number, number];
export type Quaternion = [number, number, number, number];

export interface CameraViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PerspectiveProjection {
  kind: "perspective";
  fovY: number;
  near: number;
  far: number;
  aspect?: number;
}

export interface OrthographicProjection {
  kind: "orthographic";
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;
  aspect?: number;
}

export type CameraProjection = PerspectiveProjection | OrthographicProjection;

export interface CameraTransform {
  position: Vec3;
  target: Vec3;
  up?: Vec3;
}

export interface CameraDefinition {
  id?: string;
  enabled?: boolean;
  priority?: number;
  revision?: number;
  touchedAt?: number;
  transform?: Partial<CameraTransform>;
  projection?: Partial<CameraProjection> & { kind?: CameraProjection["kind"] };
  viewport?: Partial<CameraViewport>;
  metadata?: Record<string, unknown>;
}

export interface CameraState {
  id: string;
  enabled: boolean;
  priority: number;
  revision: number;
  touchedAt: number;
  transform: CameraTransform;
  projection: CameraProjection;
  viewport: CameraViewport;
  metadata?: Record<string, unknown>;
}

export interface OrbitControl {
  type: "orbit";
  deltaAzimuth?: number;
  deltaPolar?: number;
  radiusDelta?: number;
}

export interface PanControl {
  type: "pan" | "truck";
  delta?: Vec3;
}

export interface DollyControl {
  type: "dolly";
  distance?: number;
}

export interface LookControl {
  type: "look";
  deltaYaw?: number;
  deltaPitch?: number;
  deltaAzimuth?: number;
  deltaPolar?: number;
}

export interface RollControl {
  type: "roll";
  deltaRoll?: number;
  angle?: number;
}

export interface SetLookAtControl {
  type: "set-look-at";
  position?: Vec3;
  target?: Vec3;
  up?: Vec3;
}

export type CameraControl =
  | OrbitControl
  | PanControl
  | DollyControl
  | LookControl
  | RollControl
  | SetLookAtControl;

export type CameraViewMode =
  | "editor"
  | "spectator"
  | "third-person"
  | "first-person"
  | "top-down"
  | "isometric"
  | "inspect"
  | "xr-vr"
  | "xr-ar";

export type CameraRigMode = CameraViewMode;

export interface CameraPoseView {
  eye?: "left" | "right" | "none" | string;
  position?: Vec3;
  orientation?: Quaternion;
  projectionMatrix?: readonly number[] | Float32Array;
  transformMatrix?: readonly number[] | Float32Array;
}

export interface CameraPose {
  position?: Vec3;
  orientation?: Quaternion;
  forward?: Vec3;
  up?: Vec3;
  right?: Vec3;
  referenceSpaceType?: string;
  emulatedPosition?: boolean;
  views?: readonly CameraPoseView[];
}

export interface CameraLocomotionState {
  origin?: Vec3;
  anchor?: Vec3 | null;
  yaw?: number;
  pitch?: number;
  roll?: number;
  velocity?: Vec3;
  grounded?: boolean;
}

export interface CameraComfortProfile {
  movementSpeed?: number;
  rotationSpeed?: number;
  snapTurnDegrees?: number;
  smoothTurnSpeed?: number;
  teleportDistance?: number;
  vignetteStrength?: number;
  seated?: boolean;
  grounded?: boolean;
}

export interface CameraCollisionResolution {
  position?: Vec3;
  target?: Vec3;
  up?: Vec3;
  blocked?: boolean;
  metadata?: Record<string, unknown> | null;
}

export type CameraCollisionProvider = (
  position: Vec3,
  target: Vec3,
  context: {
    camera: CameraState;
    viewMode: CameraViewMode;
    rigMode: CameraRigMode;
    pose: ResolvedCameraPose;
    locomotion: ResolvedCameraLocomotionState;
  }
) => CameraCollisionResolution | null | undefined;

export interface ResolvedCameraPose {
  position: Vec3;
  orientation: Quaternion;
  forward: Vec3;
  up: Vec3;
  right: Vec3;
  referenceSpaceType: string;
  emulatedPosition: boolean;
  views: CameraPoseView[];
}

export interface ResolvedCameraLocomotionState {
  origin: Vec3;
  anchor: Vec3 | null;
  yaw: number;
  pitch: number;
  roll: number;
  velocity: Vec3;
  grounded: boolean;
}

export interface ResolvedCameraComfortProfile {
  movementSpeed: number;
  rotationSpeed: number;
  snapTurnDegrees: number;
  smoothTurnSpeed: number;
  teleportDistance: number;
  vignetteStrength: number;
  seated: boolean;
  grounded: boolean;
}

export interface CameraUniform {
  id: string;
  viewMatrix: Float32Array;
  projectionMatrix: Float32Array;
  position: Float32Array;
  target: Float32Array;
  near: number;
  far: number;
  projectionKind: CameraProjection["kind"];
}

export interface RayViewportSize {
  width: number;
  height: number;
}

export interface RayJitter {
  x?: number;
  y?: number;
}

export interface RayCameraUniform {
  id: string;
  projectionKind: CameraProjection["kind"];
  origin: Float32Array;
  forward: Float32Array;
  right: Float32Array;
  up: Float32Array;
  viewportSize: Float32Array;
  aspectRatio: number;
  jitter: Float32Array;
  near: number;
  far: number;
  fovY: number;
  orthographicBounds: Float32Array;
  orthographicSize: Float32Array;
}

export interface PrimaryRay {
  origin: Float32Array;
  direction: Float32Array;
  near: number;
  far: number;
  projectionKind: CameraProjection["kind"];
}

export interface PrimaryRaySample {
  pixelX: number;
  pixelY: number;
}

export interface RenderPlanView {
  cameraId: string;
  order: number;
  priority: number;
  revision: number;
  hot: boolean;
  viewport: CameraViewport;
  viewMatrix?: Float32Array;
  projectionMatrix?: Float32Array;
}

export interface RenderPlanBatch {
  index: number;
  parallel: boolean;
  views: RenderPlanView[];
}

export interface RenderPlan {
  mode: "single" | "multiview";
  generatedAt: number;
  activeCameraId: string | null;
  hotCameraIds: string[];
  maxParallelViews: number;
  totalViews: number;
  canRenderInParallel: boolean;
  batches: RenderPlanBatch[];
}

export interface CameraManagerSnapshot {
  activeCameraId: string | null;
  version: number;
  updatedAt: number;
  maxParallelViews: number;
  maxHotCameras: number;
  hotCameraIds: string[];
  cameras: CameraState[];
}

export interface CameraRigConstraints {
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  firstPersonHeadOffset?: number;
  headLookMaxYaw?: number;
  headLookMaxPitch?: number;
  headLookWeight?: number;
}

export interface CameraRigAnchors {
  target?: Vec3;
  targetAnchor?: Vec3;
  character?: Vec3;
  head?: Vec3;
  headAnchor?: Vec3;
  forward?: Vec3;
  up?: Vec3;
}

export interface HeadLookIntent {
  status: "active" | "inactive" | "unavailable";
  source: CameraViewMode;
  target: Vec3;
  yaw: number;
  pitch: number;
  weight: number;
}

export interface CameraRigFrame {
  viewMode: CameraViewMode;
  rigMode: CameraRigMode;
  camera: CameraState;
  transform: CameraTransform;
  targetDistance: number;
  headLook: HeadLookIntent;
  constraints: Required<CameraRigConstraints>;
  pose: ResolvedCameraPose;
  locomotion: ResolvedCameraLocomotionState;
  comfort: ResolvedCameraComfortProfile;
  collision: {
    blocked: boolean;
    metadata: Record<string, unknown> | null;
  };
}

export interface ResolveCameraRigFrameOptions {
  id?: string;
  mode?: CameraViewMode | string;
  viewMode?: CameraViewMode | string;
  anchors?: CameraRigAnchors;
  camera?: CameraDefinition;
  transform?: Partial<CameraTransform>;
  projection?: Partial<CameraProjection> & { kind?: CameraProjection["kind"] };
  viewport?: Partial<CameraViewport>;
  constraints?: CameraRigConstraints;
  control?: CameraControl;
  activeControl?: boolean;
  offset?: Vec3;
  touchedAt?: number;
  pose?: CameraPose;
  locomotion?: CameraLocomotionState;
  comfort?: CameraComfortProfile;
  collisionProvider?: CameraCollisionProvider;
}

export interface CreateRenderPlanOptions {
  mode?: "single" | "multiview";
  enabledOnly?: boolean;
  includeMatrices?: boolean;
  maxParallelViews?: number;
  cameraIds?: string[];
  generatedAt?: number;
}

export interface CameraManagerOptions {
  maxParallelViews?: number;
  maxHotCameras?: number;
  timeSource?: () => number;
}

export interface CameraSwitchOptions {
  enabledOnly?: boolean;
}

export interface ApplyControlOptions {
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  makeActive?: boolean;
}

export interface UpdateCameraOptions extends CameraDefinition {
  makeActive?: boolean;
}

export interface CameraManager {
  registerCamera(definition: CameraDefinition): CameraState;
  updateCamera(cameraId: string, patch: UpdateCameraOptions): CameraState;
  upsertCamera(definition: CameraDefinition): CameraState;
  removeCamera(cameraId: string): boolean;
  activateCamera(cameraId: string): CameraState;
  switchCamera(direction?: number, options?: CameraSwitchOptions): CameraState | null;
  applyControl(cameraId: string, control: CameraControl, options?: ApplyControlOptions): CameraState;
  hasCamera(cameraId: string): boolean;
  getCamera(cameraId: string): CameraState | null;
  listCameras(options?: { enabledOnly?: boolean }): CameraState[];
  getSnapshot(): CameraManagerSnapshot;
  createRenderPlan(options?: CreateRenderPlanOptions): RenderPlan;
  subscribe(listener: (snapshot: CameraManagerSnapshot) => void): () => void;
  clear(): void;
}

export function buildProjectionMatrix(
  camera: Pick<CameraState, "projection">,
  overrideAspect?: number
): Float32Array;

export function buildViewMatrix(
  camera: Pick<CameraState, "transform">
): Float32Array;

export function toCameraUniform(
  camera: Pick<CameraState, "id" | "transform" | "projection">,
  overrideAspect?: number
): CameraUniform;

export function toRayCameraUniform(
  camera: Pick<CameraState, "id" | "transform" | "projection" | "viewport">,
  options?: {
    viewportSize?: Partial<RayViewportSize>;
    jitter?: RayJitter;
    aspectRatio?: number;
  }
): RayCameraUniform;

export function buildPrimaryRay(
  rayCamera: RayCameraUniform,
  sample: PrimaryRaySample
): PrimaryRay;

export function resolveCameraPose(
  pose?: CameraPose,
  fallbackTransform?: Partial<CameraTransform> | null
): ResolvedCameraPose;

export function resolveCameraLocomotionState(
  locomotion?: CameraLocomotionState
): ResolvedCameraLocomotionState;

export function resolveCameraComfortProfile(
  profile?: CameraComfortProfile
): ResolvedCameraComfortProfile;

export function applyCameraControl(
  camera: CameraDefinition,
  control: CameraControl,
  options?: {
    minDistance?: number;
    maxDistance?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    touchedAt?: number;
  }
): CameraState;

export function createRenderPlan(
  snapshot: Partial<CameraManagerSnapshot>,
  options?: CreateRenderPlanOptions
): RenderPlan;

export function resolveCameraRigFrame(
  options?: ResolveCameraRigFrameOptions
): CameraRigFrame;

export function createCameraManager(options?: CameraManagerOptions): CameraManager;

export const cameraProjectionKinds: readonly ["perspective", "orthographic"];
export const cameraControlKinds: readonly [
  "set-look-at",
  "orbit",
  "pan",
  "truck",
  "dolly",
  "look",
  "roll"
];
export const cameraRigModes: readonly [
  "editor",
  "spectator",
  "third-person",
  "first-person",
  "top-down",
  "isometric",
  "inspect",
  "xr-vr",
  "xr-ar"
];
export const cameraViewModes: readonly [
  "editor",
  "spectator",
  "third-person",
  "first-person",
  "top-down",
  "isometric",
  "inspect",
  "xr-vr",
  "xr-ar"
];
