# ADR 0003: Explicit Ray-Camera Uniforms for Renderer Integration

- Status: Accepted
- Date: 2026-06-22

## Context

`@plasius/gpu-camera` already exposes view/projection matrices and camera
uniform helpers, but the renderer backlog now needs a deterministic package API
 for generating primary rays directly from screen pixels or texel samples.

Downstream renderers should not have to reverse engineer matrix conventions or
rebuild camera basis vectors differently per consumer. They also need explicit
viewport size, aspect ratio, near/far range, and jitter inputs so sampling
behavior stays stable across CPU and GPU code paths.

## Decision

Expose a dedicated ray-facing helper surface:

- `toRayCameraUniform(camera, options)` returns a renderer-ready uniform with
  camera basis vectors, projection kind, viewport size, aspect ratio,
  perspective FOV or orthographic bounds, jitter inputs, and clip range.
- `buildPrimaryRay(rayCamera, sample)` maps a pixel or texel coordinate to a
  deterministic primary ray for perspective and orthographic cameras.

The helpers remain plain-data and framework-agnostic. They reuse the existing
camera normalization rules so control updates, render planning, matrix helpers,
and ray generation all share the same camera semantics.

## Consequences

- Positive: Renderers can consume one stable package API instead of duplicating
  camera basis or projection math.
- Positive: Tests can lock down center/corner/jitter behavior independent of a
  specific renderer implementation.
- Positive: Orthographic and perspective cameras now share one explicit
  ray-generation contract.
- Tradeoff: The public API surface grows and now carries additional projection
  details that must remain backward compatible.

## Alternatives Considered

- Reconstruct rays from the existing matrix helpers in each renderer: Rejected
  because it duplicates math, obscures jitter semantics, and risks convention
  drift across consumers.
- Add renderer-specific helpers in `gpu-renderer`: Rejected because the camera
  package is the correct reusable boundary for framework-agnostic camera data.
