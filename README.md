# gaesup-world

A TypeScript 3D world library for React Three Fiber: WebGPU-first rendering, physics characters, building, NPCs, multiplayer and a persistent world model. Scene data can be exchanged with Unity.

[Live demo](https://jigglypop.github.io/gaesup-world/) · [User guide](docs/user-guide.md) · [Developer guide](docs/developer-guide.md) · [한국어](README.ko.md)

This release is `1.1.0`. Check the npm registry for publication status.

## Run the example

```sh
corepack pnpm install
corepack pnpm dev --host 127.0.0.1 --port 5174
```

Open http://127.0.0.1:5174/. `examples/minihome` builds a small village with the public API only: `GaesupWorld`, `WorldPhysics`, `GaesupController`, `BuildingController` and wandering NPCs. Walk with WASD.

## Use the library

A matching React 19 peer set:

```sh
npm install gaesup-world react@19 react-dom@19 three@0.185 three-stdlib @react-three/fiber@9 @react-three/drei@10 @react-three/rapier@2 @react-three/postprocessing@3
```

React 18/Fiber 8 are also declared peers, but that combination needs separate consumer validation.

```ts
import { createSceneDocument, createSceneDocumentController } from 'gaesup-world';

const controller = createSceneDocumentController(createSceneDocument({
  id: 'my-room',
  objects: [{ id: 'chair', name: 'Chair' }],
}));
controller.dispatch({
  type: 'scene-object.update',
  objectId: 'chair',
  patch: { transform: { position: [2, 0, 0] } },
});
const savedScene = JSON.stringify(controller.getSnapshot());
```

Scene data is serializable. React, Three.js and physics objects belong to runtime projections. Edits use the document controller. Editor UI is available through `gaesup-world/editor`; a complete general-purpose Studio is still under development.

## Unity

The preview adds `exportUnityScene` and `importUnityScene`: local transforms, hierarchy, IDs and component metadata, in meters, with quaternion and Z-axis conversion. Included Unity Editor scripts read/write this JSON. GLB exports geometry and materials for compatible importers. Neither path transfers arbitrary scripts or imports native `.unity` files.

## Verify and deploy

```sh
corepack pnpm run verify:full
corepack pnpm run build:demo
```

`test:demo` checks build structure, not rendering.

`npm run deploy` builds `demo-dist` and publishes it to GitHub Pages. Override `GAESUP_BASE_URL` for another base path. `version.json` records version, commit, dirty state and build time. Pages deep links use `404.html`; an unknown route may render while retaining HTTP 404.

For npm, validate, authenticate with `npm login`, pack the reviewed build and run `npm publish <tarball>` without a custom tag.

## Current limits

- World matrices preserve shear. `getWorldTransform` throws for shear or singular bases; use `getWorldMatrix` when TRS cannot represent the result.
- Unity compilation and real Editor round-trip require a Unity installation. TypeScript tests alone do not prove them.

