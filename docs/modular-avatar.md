# Modular avatar v1

`gaesup-world/avatar` implements the Phase 1 modular avatar contract. Each runtime owns one canonical skeleton and one existing `AnimationSystem`. Equipment uses that skeleton; source GLB rigs are never attached to the scene. Existing character, motion, inventory, save and network APIs remain available.

## Consumer API

Register `AssetRecord`s with the existing `useAssetStore`, or pass an existing `AssetSource.getAsset` resolver to `AvatarProvider`. The demo catalog is `public/gltf/avatars/manual-v1/catalog.json`.

```tsx
import { Avatar, AvatarProvider, useAvatarEquipment } from 'gaesup-world/avatar';

// Inside an R3F Canvas. An explicit provider is optional for this standalone form.
<Avatar
  body="body-sd-neutral-v1"
  equipment={{ hair: 'hair-001', top: 'top-001', bottom: 'bottom-001', shoes: 'shoes-001' }}
  animation="walk"
  onError={reportError}
/>

// Put a provider around the Canvas and controls to share one runtime with hooks.
// const { equip, unequip, equipment } = useAvatarEquipment();
// await equip('top', 'top-002');
// unequip('hat');
```

`AvatarProvider` owns runtime disposal. It creates resources in an effect, including under React StrictMode. `useAvatar()` returns `null` during initialization. `Avatar` owns the frame update and mounts the scene with automatic R3F disposal disabled. Mount one `Avatar` view per provider. `equipment` props declare a complete outfit when changed; omit that prop for an entirely imperative outfit. `onReady` fires after the requested body/outfit is assembled.

Without React:

```ts
import { AvatarRuntime } from 'gaesup-world/avatar';
import { useAssetStore } from 'gaesup-world/assets';

const avatar = new AvatarRuntime({
  avatarId: 'player-123',
  getAsset: id => useAssetStore.getState().getAsset(id),
});
await avatar.restore({ body: 'body-sd-neutral-v1', equipment: { top: 'top-001' } });
await avatar.equip('top', 'top-002');
avatar.unequip('hat');
avatar.playAnimation('walk');
// scene.add(avatar.scene); avatar.update(deltaSeconds) in the host frame loop.
// avatar.dispose() when the persistent entity is retired.
```

The `scene` property is an advanced renderer integration boundary, not an ownership transfer. `getState()`, `getEquipment()` and `getDiagnostics()` return serializable values. React snapshots are frozen. Consumers must not edit the skeleton or shared geometry/material resources.

## Canonical asset contract

- Rig: `gaesup-humanoid-v1`, defined in [rig.json](../src/avatar/core/rig.json). The 23 canonical bone IDs, parent chain and rest translations are fixed. The initial body is `SD_NEUTRAL_V1` in A-pose, meters, Y-up. Arm pose is encoded by the rest bone positions.
- Extend an existing `AssetRecord` with kind `avatar-body`, `avatar-part`, or reserved `avatar-animation`, and `metadata.avatar`. The validated `assetId` and kind must match the catalog record. Existing catalog kind/slot filters and HTTP sources recognize avatar entries.
- Metadata contains schema/version, slot, rig, body archetypes, source URI, exact glTF node and primitive indices, and canonical bone ID → glTF node index mappings. Rendering does not infer slot, body region or bone meaning from mesh/material/node names.
- `skinned` assets require canonical rest matrices and inverse binds, a canonical parent hierarchy, normalized mesh/bind transforms, four influences per vertex, valid joint indices and normalized finite weights. Unsupported input fails before the committed outfit changes. Different source joint ordering is remapped on an owned geometry clone without mutating the cache.
- `bone` and `socket` attachments use the declared canonical target. Rigid geometry is authored in attachment-local coordinates. Socket transforms live in [skeleton.ts](../src/avatar/runtime/skeleton.ts).
- Body regions map all body primitives to disjoint logical regions. Masking takes the union of equipped parts' `hideBodyRegions`; unequipping recomputes it. This is explicit visibility control, not hidden-body reconstruction or cloth collision detection.
- Root-relative and absolute source URIs load directly. A relative source URI resolves against `AssetRecord.url`, which must identify the base GLB. Publish immutable versioned URLs when changing bytes. Reuse is limited to identical resolved metadata, identity, version and LOD.
- LOD entries contain only `level`, `source`, `meshes`, `bones`, and optional `bodyRegions`. They cannot override compatibility or attachment semantics. `setLOD(level)` swaps transactionally, selecting the highest declared level at or below the request; missing LODs retain LOD0. Distance thresholds belong to the host quality policy.

Equipment mutations are serialized. Onepiece replaces top/bottom; top or bottom replaces onepiece. Slot/rig/body/dependency/conflict validation and assembly precede commit. Failed loads keep the previous outfit and allow an explicit retry. `unequip` and `dispose` invalidate work already queued or loading; those promises reject as superseded. Callers must handle rejected promises.

The common `src/core/assets/GLTFAssetCache.ts` owns downloads and parsed GPU resources. Concurrent consumers share the same URI lease. Per-avatar skeletons and remapped geometries are independent. Source geometry/material/texture/skeleton resources are disposed at the last release; failed parses can be retried. Loader injection supports a host-configured GLTFLoader. KTX2/Meshopt setup and preloading policies are not enabled by this MVP.

Animation clips initially supplied by the canonical body are copied and registered once on the runtime's existing `AnimationSystem`. Source track addresses are resolved through the manifest's node mappings onto canonical bone IDs. They belong to the canonical rig for the runtime lifetime; swapping a visual body or outfit preserves them and the mixer clock. Swapping animation packs, retargeting another rig and a network animation state machine are outside Phase 1.

## Save and network boundary

`createAvatarStore(initial)` is an engine-neutral, serializable store. `createAvatarSaveBinding(store)` registers the `avatar` domain with an existing `SaveSystem`; `createAvatarPlugin(store)` integrates the same store through the existing plugin/save-extension registry. Choose either binding path for a given SaveSystem, not both.

```ts
const store = createAvatarStore(initial);
const unregister = saveSystem.register(createAvatarSaveBinding(store));
store.getState().setAvatar(avatar.getState());
await saveSystem.save();

await saveSystem.load();
await avatar.restore(store.getState().avatar);
// Await visual restore separately: SaveSystem hydrates serializable data synchronously.
unregister();
```

Only body/equipment asset IDs are saved. `prepareHydrate` validates without mutation before SaveSystem commits; a missing avatar domain restores the supplied defaults. The demo awaits actual GLB restoration after save load, and reports loading errors.

For transport, `JSON.stringify({ entityId, avatar: avatar.getState() })` is the ID-only snapshot. The receiving host validates with `parseAvatarState` and awaits `remoteAvatar.restore`. A live multiplayer transport binding, equip deltas, ownership checks and inventory item-to-asset mapping remain Phase 2 responsibilities of the existing network/inventory domains.

## Demo and evidence

Run `corepack pnpm dev` and open `/avatar`. The page provides equipment replacement/removal, seven animation poses, explicit save/load, reload restoration, failure display, and a developer LOD control. It uses the existing WebGPU-first renderer with its WebGL compatibility fallback.

`corepack pnpm avatar:fixtures` regenerates original MIT-licensed procedural fixtures from `scripts/build-avatar-fixtures.mjs`: one body, three hair, three top, three bottom, two shoes, two hats, one bag, one hand item and one onepiece. The 17 catalog records include 34 GLBs with genuine lower resolution LOD1 geometry. `evidence.json` records source provenance, byte hashes and glTF validation counts. No supplied or approved source character was altered. These visibly segmented fixtures test runtime behavior; they are not production clothing or an approved art pack.

```powershell
corepack pnpm test -- src/avatar/__tests__/avatar.test.ts --runInBand
corepack pnpm exec tsc --noEmit
corepack pnpm run build
corepack pnpm run test:package:built
$env:AVATAR_BROWSER_CHANNEL = 'chrome' # Omit to use Playwright's Chromium.
corepack pnpm run test:avatar:browser
```

The browser probe uses a temporary local Vite server and isolated browser storage, tests real catalog/GLB loads, failure rollback/retry, save+reload, onepiece rules and LOD replacement, and captures all seven poses and responsive layouts in `.tmp/avatar-browser`. `result.json` reports the actual renderer and adapter rather than treating a unit test as GPU evidence.

Later phases remain unimplemented: Tripo submission/segmentation/completion, automatic retopology/weight transfer, Blender headless compiler and `.blend` delivery, production asset admission/art approval, spring bones, live inventory/network bindings, KTX2/Meshopt defaults, distance-based LOD scheduling and far-avatar baking. The optional `game-dev` CLI is not installed in this environment; no game-dev package receipt or paid provider execution is claimed.

## Local validation on 2026-09-14

| Check | Observed result |
| --- | --- |
| Authored fixture validation | 17 records, 34 GLBs, 1,503,904 total GLB bytes, zero glTF errors |
| Final avatar integration suite | 14 passed; actual GLB parsing, joint remapping, track target remapping, failure rollback, queue cancellation, seven poses, LOD, reference counts and fresh-runtime save restore |
| Related asset/character/save/motion/route suites | 16 suites / 152 tests passed before the final additional track-remapping test |
| Public API/package export tests | 25 passed after final changes |
| TypeScript / changed-file ESLint / ESM+CJS+declarations | Passed |
| Packed package consumer | Passed ESM/CJS runtime imports, strict declarations, and consumer Vite build. Harness pins the installed React/React DOM pair, avoiding the registry's React 19.3 versus R3F 9.7 peer conflict; published peer ranges were not changed. |
| Browser | Passed on Chrome WebGPU, NVIDIA Blackwell adapter; save+reload, failed-load rollback/retry, onepiece, LOD, seven pose captures, no page exceptions and no horizontal mobile overflow. The earlier Chromium run also exercised WebGL fallback. |
| Full `verify` | Blocked at the existing missing `.codex/hooks/astra-guard.test.mjs` entry. No whole-suite success claim. |
| `test:demo` | Vite production build completed; the existing `.mailbox-panel` / `.mailbox-list` CSS expectation failed. Rebuilding with HEAD versions of all changed tracked source modules and without the new avatar route reproduced both missing selectors. |

Inspect `.tmp/avatar-browser/result.json`, `.tmp/avatar-package.log`, `.tmp/avatar-final-tests.log`, `.tmp/avatar-verify.log`, and `.tmp/avatar-baseline-demo-result.json` for local evidence. The attempted detached preview server was denied by automatic execution review (`blocked by policy`, no detailed reason). The browser probe's temporary server closed normally; launch the interactive example yourself with `corepack pnpm dev` when needed.
