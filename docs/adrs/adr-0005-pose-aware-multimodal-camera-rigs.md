# ADR 0005: Pose-Aware Multimodal Camera Rigs

## Status

Accepted

## Context

`@plasius/gpu-camera` already owned camera math, render planning, and the first
set of animated character rig modes. The multimodal camera-controls platform
extends the runtime beyond flat-screen touch and mouse input into XR pose
composition, free locomotion, comfort presets, and collision-aware rig
resolution.

Those responsibilities need to stay in the camera math layer instead of being
reimplemented in `@plasius/gpu-camera-controls`, `@plasius/gpu-xr`, or route
consumers.

## Decision

`@plasius/gpu-camera` remains the authoritative rig-resolution package and now
accepts additive pose-aware contracts:

- `CameraPose`
- `CameraLocomotionState`
- `CameraComfortProfile`
- `CameraCollisionProvider`

`resolveCameraRigFrame(...)` is extended to support `top-down`, `isometric`,
`inspect`, `xr-vr`, and `xr-ar` rig modes while preserving the existing
editor/spectator/third-person/first-person behaviors as compatible aliases.

XR and locomotion consumers compose viewer pose, locomotion intent, comfort, and
collision through the rig resolver rather than maintaining separate pose math.

## Consequences

- One camera math authority now serves browser, gamepad, XR, and tool-driven
  camera modes.
- `@plasius/gpu-camera-controls` can stay focused on input semantics instead of
  duplicating pose, locomotion, or collision math.
- Route consumers receive one deterministic rig output model across flat-screen
  and XR surfaces.
