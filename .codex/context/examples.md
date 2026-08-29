# Examples Architecture

## Responsibilities

Examples are simultaneously a public library consumer, integration environment, product showcase and future UX prototype.

## Product routes

- `/`: product introduction and clear entry points
- `/world`: coherent playable world
- `/creator`: world creation entry
- `/multiplayer`: multiplayer validation
- `/assets`: Blender and GLB catalog validation
- `/performance`: measured CPU/WebGPU performance scenarios

## Developer routes

Minimal integration, editor-specific pages, blueprint diagnostics, admin tests and experimental next-core views remain accessible under the Developer catalog. Existing URLs may remain as compatibility aliases.

## UX rules

- World is visually primary and debug UI is opt-in.
- Navigation exposes scenarios rather than a flat component gallery.
- Shared shell owns top-level navigation, route loading and developer access.
- Public package entries are the only library imports.
- Existing features are classified as retain, integrate, move to Developer or remove only when unused and duplicated.
