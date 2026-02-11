# ADR 0001: Framework-Agnostic Camera Controls Runtime

- Status: Accepted
- Date: 2026-02-11

## Context

`camera-controls` is tied to Three.js-specific camera/runtime assumptions. The
Plasius renderer migration requires removing this dependency while preserving
camera interaction behavior and predictable state transitions.

## Decision

Create `@plasius/gpu-camera` as a framework-agnostic camera control runtime.

- Keep camera state in plain data structures (transform, projection, viewport).
- Implement control primitives (`orbit`, `pan`, `dolly`) without Three.js.
- Expose deterministic matrix/uniform builders for downstream renderers.

## Consequences

- Positive: Camera orchestration can be reused in WebGPU, workers, and non-Three renderers.
- Positive: Existing apps can migrate incrementally by adapting only camera binding code.
- Negative: Existing Three helper components must be replaced with explicit bindings.

## Alternatives Considered

- Continue using `camera-controls`: Rejected due to Three.js coupling.
- Build controls directly in each app: Rejected due to duplication and drift.
