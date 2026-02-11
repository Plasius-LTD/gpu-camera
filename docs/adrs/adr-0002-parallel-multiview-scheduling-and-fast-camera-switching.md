# ADR 0002: Parallel Multiview Scheduling and Fast Camera Switching

- Status: Accepted
- Date: 2026-02-11

## Context

Scene requirements include multiple concurrent cameras, parallel multi-view
rendering, and low-latency switching between viewpoints.

## Decision

Use a camera manager with:

- priority-ordered camera registry,
- bounded hot-camera set for recent/likely switches,
- render plan batching with configurable `maxParallelViews`,
- active camera promotion to the front of batch ordering.

## Consequences

- Positive: Multi-view rendering can execute in parallel batches deterministically.
- Positive: Fast camera switching uses warmed/hot camera paths.
- Negative: Consumers must map the render plan to concrete backend render passes.

## Alternatives Considered

- Single-camera runtime only: Rejected; insufficient for split-screen/minimap/XR mirrors.
- Naive all-camera single batch: Rejected; poor control over GPU scheduling pressure.
