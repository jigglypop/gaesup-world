# Web Studio plan — 2026-09-19

[한국어 / detailed baseline audit](2026-09-19-web-studio-plan.md) · [Current implementation notes](release-2.0.0-next.0.md)

This is the plan from the initial audit of commit `c892520a`, before the subsequent implementation. Findings below describe that baseline; consult release notes and test logs for changes made afterward. Durations are planning estimates for one or two core developers, not completed work.

## Product direction

Keep “Unity in the browser” as the long-term ambition. Start with a smaller promise: a React developer can create a playable 3D room in ten minutes and share or embed it. Mini-rooms and small social spaces reuse this repository's existing scene model and example. Demand and commercial viability still need user evidence.

One workflow must connect project creation, asset placement, interaction, play/stop, save/recovery and publication. A list of engine APIs does not prove that workflow. Keep the npm SDK as the developer distribution channel and Studio as the place people try and activate the product.

## Baseline findings

- Local version was 1.0.2; npm latest was 1.0.30. Publishing 1.0.2 again was rejected. npm authentication returned 401.
- The GitHub homepage returned 404. The deploy script published library output `dist` instead of demo output `demo-dist`.
- `verify` referred to a deleted harness file. Lint reported 64 errors.
- The example router exposed a mini-home and `/engine`; README advertised several routes that no longer existed.
- Hierarchy transform composition simply added positions/Eulers. A parent rotated by π/2 around Z with scale 2 left a child's [1,0,0] position unchanged, instead of producing [0,2,0].
- Editor panels, command history and play snapshots existed but lacked a connected authoring session in the public examples.
- SceneDocument/controller, serializable components and independent package-consumer checks were useful foundations.
- Mini-home saves were manual and browser-local. They did not establish accounts, cross-device recovery, cloud publication or collaboration.

Baseline checks: build, 26 public API/export tests, consumer checks, publint and static demo checks passed. Full verification did not pass. Browser rendering was not verified during that initial audit.

## Market and technology check

The research covered relevant official releases and current documentation, not every change in every competing product. Features in current documentation are not all new in 2026.

| Product | Official evidence | Implication |
|---|---|---|
| Unity 6.6 | August 24 announcement: supported WebGPU, compute-dependent graphics features, device filtering and WebGL2 fallback. | Browser rendering is competitive; focus on fast authoring and distribution. Unity Web output is distinct from browser-hosted authoring. |
| PlayCanvas Editor | Browser WebGL/WebGPU/WebXR editor, open frontend, MCP integration. | Browser editing and an AI connection alone are insufficient differentiation. |
| SuperSplat | September 9 Editor 3.0 WebGPU rebuild; August 17 publishing API. | Distinguish splat tooling from general PlayCanvas editor capabilities. Splat production is not required for the first mini-room product. |
| Babylon.js 9.0 | March 26 release: clustered lighting, particles, volumetrics, frame graph, retargeting, splats, Inspector v2, large-world/geospatial tools and navigation/audio improvements. | Competing on renderer feature count is expensive. Prioritize a useful workflow and React integration. |
| Spline | Current docs describe collaboration, AI/MCP, undoable edits, Code Tab, React/public URL export, components and multi-scenes. | Editing, code and sharing must connect smoothly. Persistent game worlds remain a possible specialization. |
| Three.js | WebGPURenderer, TSL and WebGL2 fallback. | Retain the current rendering base and verify actual backends separately. |
| React Three Rapier | v2 supports Fiber v9 and React 19. | Test matching peer sets; declared ranges are not installation evidence. |
| Godot Web Editor | Stable docs describe preliminary authoring and limitations; the page also warns its 4.7 update is incomplete. | Do not equate “opens in a browser” with production authoring, or treat potentially stale restrictions as universal. |

Sources: [Unity](https://discussions.unity.com/t/webgpu-out-of-experimental-in-unity-6-6/1734694), [PlayCanvas](https://github.com/playcanvas/editor), [SuperSplat updates](https://blog.playcanvas.com/), [Babylon.js](https://babylonjs.medium.com/welcome-to-babylon-js-9-0-c3edc9ee6428), [Spline](https://docs.spline.design/basics/what-is-spline), [Three.js](https://threejs.org/manual/pages/webgpurenderer), [Rapier](https://pmndrs.github.io/react-three-rapier/), [Godot](https://docs.godotengine.org/en/stable/tutorials/editor/using_the_web_editor.html).

## Adoption evidence and hypotheses

The September 19 lookup returned 22 GitHub stars, 4 forks and 0 open issues. npm returned 2,542 downloads for August 18–September 16. Downloads are installation events, not people, active projects or retention. Relative-date endpoints change over time.

The broken demo, placeholder model URL, stale routes, release mismatch and broad positioning are observed friction. Their contribution to low adoption is a hypothesis to validate through user observation and funnel data. Zero issues does not prove stability or lack of demand.

Sources: [repository API](https://api.github.com/repos/jigglypop/gaesup-world), [download API](https://api.npmjs.org/downloads/point/last-month/gaesup-world), [registry](https://registry.npmjs.org/gaesup-world).

## Delivery sequence

### Week 1: release and first contact

Repair harness/lint and transform math, including rotation, nonuniform scale, nesting, reparenting and shear policy. Compare npm 1.0.30 against current exports and behavior in an isolated consumer. Use a minor release only if compatibility is demonstrated; otherwise prepare a major prerelease and migration guide. Validate `next` before promoting `latest`.

Fix demo output, base paths, deep links and asset URLs. Replace placeholders with an executable starter and English/Korean instructions. Acceptance: a clean installation runs its first scene, the published homepage and assets load, and the actual browser renders and responds.

### Weeks 2–4: one complete Studio

Create a Studio route using existing hierarchy, inspector, gizmo, asset panel and history. One EditorSession owns document controller, selection, history, play snapshot and save binding. Persistent edits share one command path.

Connect create/select/duplicate/delete, transform/snap, undo/redo and play/pause/stop. Play begins from an editing snapshot; Stop restores it unless runtime changes are explicitly applied. Define versioned project and asset manifests, autosave failure handling, export/import and migrations.

Acceptance: automated browser round-trip from room creation to edit, undo, play/stop, save, reload and continued editing. No stale subscriptions across projects. Initial user goal: 4 of 5 observers finish without help in ten minutes.

### Weeks 5–6: sharing and React consumption

Publish immutable scene revisions with asset manifests. Start with static export and React embed, then connect hosted publication using the same artifact. Add remix, revision recovery and retry behavior.

Measure runtime-only, controller-only and editor consumers separately. A fixture importing many APIs is not a minimum bundle benchmark. Acceptance: an unauthenticated recipient plays the shared result and a separate React app runs its export.

### Weeks 7–8: repeat-use game behavior

Provide a small set of useful actions: doors, proximity interactions, simple NPC dialogue, triggers and room transitions. Add multiplayer join/leave/reconnect, authoritative mutations and snapshot recovery. Collaborative editing is a separate contract from game networking.

Validate avatar/GLB axes, scale, collision, animation and provenance. Paid AI generation is not required for first use. Acceptance: two browsers converge after reconnect and new features correspond to repeated user requests.

### Weeks 9–12: expand demonstrated demand

Build AI/MCP on inspection and validated, previewable, undoable command transactions. Publish three real user examples and remixable templates. Candidate paid services are hosted projects, team permissions/versioning and asset hosting; pricing follows interviews and measured costs.

Initially defer full Unity API replication, a renderer rewrite, every native target, a marketplace, general visual scripting and a dedicated splat production pipeline.

## Measure useful adoption

Track landing → template open → first edit → first play → save → publish → seven-day return/edit. Define activation as edit+play+save, excluding passive visitors and CI installations.

Proposed experiments, not achieved results: observe 10 external developers in the first month and target 8 activations within ten minutes; then target 10 externally authored public projects and 30% seven-day re-editing among activated users. Always show sample size and denominator.

Review activation time median/p90, save/publish failures, shared-link play success and seven-day re-editing weekly. High visits with low activation suggests workflow friction. Good activation but poor return suggests a weak use case. Strong repeat use with few users suggests a distribution problem.
