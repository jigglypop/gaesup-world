# gaesup-world

Build a playable 3D room in your browser. Use scene data in React and exchange layouts with Unity.

[Live mini-home](https://jigglypop.github.io/gaesup-world/) · [한국어](README.ko.md) · [Mini-home guide](docs/minihome.en.md) · [Unity bridge](docs/unity.en.md)

This repository contains a TypeScript world library and a Cyworld-inspired mini-home: a 3D room, walking avatar, furniture, profile, diary and guestbook. It saves in your browser. Shared links contain a snapshot; they are not a multiplayer service.

This release is `1.0.32`. Check the npm registry for publication status.

## Run the mini-home

```sh
corepack pnpm install
corepack pnpm dev --host 127.0.0.1 --port 5174
```

Open http://127.0.0.1:5174/. The separate rendering showcase is at `/engine`. No model URL, AI key or Unity installation is needed. The UI is currently Korean; the English guide maps its buttons to their actions.

1. Choose **미니룸 꾸미기** (Edit room), add furniture and drag it.
2. Edit your profile and theme. Undo/redo covers room and notes together.
3. Changes autosave after 1.2 seconds. **미니홈피 저장** saves immediately.
4. Download a JSON backup or recover the previous valid save.
5. Share the profile and room snapshot, or export the visible room as GLB.

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

The preview adds `exportUnityScene` and `importUnityScene`: local transforms, hierarchy, IDs and component metadata, in meters, with quaternion and Z-axis conversion. Included Unity Editor scripts read/write this JSON. GLB exports geometry and materials for compatible importers. Neither path transfers arbitrary scripts or imports native `.unity` files. [Setup and limits](docs/unity.en.md).

## Verify and deploy

```sh
corepack pnpm run verify:full
corepack pnpm run test:minihome:browser
corepack pnpm run build:demo
```

The browser probe expects the dev server on 5174 and local Chrome; WebGPU and WebGL2 fallback are separate checks. `test:demo` checks build structure, not rendering.

`npm run deploy` builds `demo-dist` and publishes it to GitHub Pages. Override `GAESUP_BASE_URL` for another base path. `version.json` records version, commit, dirty state and build time. Pages deep links use `404.html`; an unknown route may render while retaining HTTP 404.

For npm, validate, authenticate with `npm login`, pack the reviewed build and run `npm publish <tarball>` without a custom tag.

## Current limits

- No account login, cross-device save, live visits or collaborative editing in the mini-home.
- Shared links omit diary/guestbook entries; anyone holding the link can read its profile and room.
- World matrices preserve shear. `getWorldTransform` throws for shear or singular bases; use `getWorldMatrix` when TRS cannot represent the result.
- Unity compilation and real Editor round-trip require a Unity installation. TypeScript tests alone do not prove them.

[Implementation plan](docs/2026-09-19-web-studio-plan.en.md) · [Release notes](docs/release-1.0.32.md)
