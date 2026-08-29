# World Model

## Target contract

```text
WorldDocument
  schemaVersion
  entities: WorldEntity[]
  prefabs: PrefabReference[]
  metadata

WorldEntity
  id: EntityId
  components: ComponentData

WorldCommand -> canonical mutation
WorldEvent -> accepted mutation result
Query -> derived read model
Migration -> schema upgrade
```

The contract must use engine-neutral serializable data. It does not contain Three.js objects, Rapier handles, React refs, DOM nodes or store instances.

## Current gap

World, editor, building and domain stores each own useful state, but no versioned document coordinates them. Introducing WorldDocument must begin with a narrow persistent domain and adapter, not by replacing all stores.

## First recommended slice

Define the document and command types around a small scene-object or prefab subset, adapt existing storage, and prove editor/runtime projection and save round-trip. Building integration follows only after the canonical write path is measured and tested.
