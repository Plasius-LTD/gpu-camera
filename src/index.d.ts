export type Vec3 = [number, number, number];

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

export interface SetLookAtControl {
  type: "set-look-at";
  position?: Vec3;
  target?: Vec3;
  up?: Vec3;
}

export type CameraControl = OrbitControl | PanControl | DollyControl | SetLookAtControl;

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

export function createCameraManager(options?: CameraManagerOptions): CameraManager;

export const cameraProjectionKinds: readonly ["perspective", "orthographic"];
export const cameraControlKinds: readonly [
  "set-look-at",
  "orbit",
  "pan",
  "truck",
  "dolly"
];
