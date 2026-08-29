# Asset Pipeline

## Target flow

```text
.blend -> Blender export -> GLB -> validation -> manifest -> runtime catalog -> streaming and projection
```

## Target asset model

An asset record should be able to evolve toward `assetId`, `version`, `kind`, `source`, `bounds`, `lods`, `colliders`, `sockets`, `roomVolumes`, `interactionAnchors`, `materials` and `tags`.

## Rules

- Asset ID is stable and independent from URL.
- Runtime behavior does not infer semantics from mesh names.
- Blender custom properties are converted to explicit validated manifest data.
- Collider, socket, room, LOD and interaction metadata are engine-neutral.
- Meshopt and KTX2 are pipeline capabilities, not assumptions embedded in domain state.

The current `src/core/assets` catalog and public assets entry are the starting point. Extend the schema in slices and keep existing consumers compatible.
