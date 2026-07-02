# ADR 0004: Animated Character Camera Rigs

- Status: Accepted
- Date: 2026-07-02

## Context

The GPU Demo animated character scene needs editor, spectator, third-person,
and first-person camera modes without adopting Three.js or a renderer-local
camera-controls dependency. Third-person and first-person modes also need to
publish camera-derived head-look intent so animation systems can blend that
intent after clip playback.

## Decision

Expose a framework-agnostic rig resolver from `@plasius/gpu-camera`.
`resolveCameraRigFrame(...)` accepts plain camera state, anchors, constraints,
and optional control input, then returns the resolved camera transform,
target distance, normalized constraints, and head-look intent.

Third-person rigs clamp target distance to the configured maximum, defaulting
to 10m. First-person rigs resolve from the head anchor plus a configurable
forward offset, defaulting to 0.05m. Head-look intent is emitted as data only;
renderer and animation packages remain responsible for applying it to bones.

## Consequences

- Positive: Renderers can share camera-mode semantics without duplicating rig
  math or adding framework dependencies.
- Positive: Head-look feedback stays explicit and testable instead of mutating
  animation data inside the camera package.
- Positive: Legacy camera manager, matrix, and ray-uniform APIs remain
  backward compatible.
- Tradeoff: Downstream renderers must provide sensible character anchors and
  decide how to blend head-look intent into their animation systems.

## Alternatives Considered

- Add Three.js camera-controls directly: Rejected because the package boundary
  must stay framework-agnostic.
- Implement mode-specific camera logic only in `gpu-renderer`: Rejected because
  Product, animated, and future GPU demo scenes need shared camera semantics.
