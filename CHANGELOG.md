# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- **Added**
  - (placeholder)

- **Changed**
  - Updated to the surviving `@plasius/gpu-shared` 1.0.14 line and the fixed esbuild resolution.

- **Fixed**
  - (placeholder)

- **Security**
  - Pinned patched transitive npm dependencies to clear the current audit baseline.
  - Added fail-closed source and npm-package admission for the administrative contributor registry and pinned the CI/CD runtime to Node.js 24.18.0 LTS.
  - (placeholder)

## [0.1.18] - 2026-07-11

- **Added**
  - Added pose-aware camera contracts for `CameraPose`,
    `CameraLocomotionState`, `CameraComfortProfile`, and
    `CameraCollisionProvider`.
  - Added rig-mode support for `top-down`, `isometric`, `inspect`, `xr-vr`,
    and `xr-ar`, while preserving the existing editor/spectator/third-person/
    first-person aliases.

- **Changed**
  - Extended `resolveCameraRigFrame(...)` so XR pose composition, locomotion,
    comfort, and collision resolution now flow through the authoritative camera
    rig layer.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.17] - 2026-07-02

- **Added**
  - Added framework-agnostic animated character camera rig modes, including
    editor, spectator, third-person, and first-person views.
  - Added `resolveCameraRigFrame(...)`, `cameraViewModes`, `look` camera
    control input, and head-look intent output for renderer animation systems.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.16] - 2026-06-29

- **Added**
  - (placeholder)

- **Changed**
  - Refreshed the direct dependency baselines to `@plasius/gpu-shared@^1.0.1`,
    `eslint@^10.6.0`, and `globals@^17.7.0`, and regenerated
    `package-lock.json` from a clean Node 24 install.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.15] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.14] - 2026-06-22

- **Added**
  - Added `toRayCameraUniform` and `buildPrimaryRay` helpers so renderers can
    derive deterministic perspective and orthographic primary rays from screen
    pixels or texels.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.13] - 2026-06-22

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.10] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.9] - 2026-05-13

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.8] - 2026-04-02

- **Added**
  - Contract tests that keep the demo on the public `@plasius/gpu-shared`
    browser import surface.

- **Changed**
  - Updated the demo documentation to describe the live 3D harbor validation
    scene and camera switching behavior.

- **Fixed**
  - Removed the demo's deep import of `@plasius/gpu-shared` internals in favor
    of an import-map-backed package import.

- **Security**
  - (placeholder)

## [0.1.7] - 2026-03-23

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.6] - 2026-03-14

- **Added**
  - (placeholder)

- **Changed**
  - Updated GitHub Actions workflows to run JavaScript actions on Node 24,
    refreshed core workflow action versions, and switched Codecov uploads to
    the Codecov CLI.

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.5] - 2026-03-04

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.2] - 2026-03-01

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.1] - 2026-02-28

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.0] - 2026-02-11

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.0] - 2026-02-11

- **Added**
  - (placeholder)

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)

## [0.1.0] - 2026-02-11

### Added
- Initial release of `@plasius/gpu-camera`.
- Multi-camera registry with deterministic active-camera switching.
- Parallel multiview render planning with batch partitioning.
- Camera control primitives (`orbit`, `pan`, `dolly`) independent from Three.js.

### Changed
- N/A

### Fixed
- N/A


[0.1.0]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.0

## [0.1.0] - 2026-02-11

- **Added**
  - Initial release.

- **Changed**
  - (placeholder)

- **Fixed**
  - (placeholder)

- **Security**
  - (placeholder)
[0.1.1]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.1
[0.1.2]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.2
[0.1.5]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.5
[0.1.6]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.6
[0.1.7]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.7
[0.1.8]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.8
[0.1.9]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.9
[0.1.10]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.10
[0.1.13]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.13
[0.1.14]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.14
[0.1.15]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.15
[0.1.16]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.16
[0.1.17]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.17
[0.1.18]: https://github.com/Plasius-LTD/gpu-camera/releases/tag/v0.1.18
