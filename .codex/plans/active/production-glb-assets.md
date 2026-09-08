# Product GLB assets and reference scene

## 목표와 범위

- Canonical production path: local source → versioned manifest → hash-bound quality evidence → published catalog. Existing seed/AssetRecord consumers remain compatible and are not implicitly approved.
- Deliver local Meshy/Blender tooling, a new gaesup-mascot-v1 character with two outfits, reference furniture/tree/house, browser loading and review, then measured publication.
- Meshy candidates: two per chair/table/sofa/planter/tree; credentials remain local. Art approval belongs to the user. Missing device evidence cannot pass publication.
- Existing epoch-8a legacy parts remain independently rebuildable; no overwrite of existing assets or rig contracts.

## 검증

- Focused assets tests, build and examples typechecks, changed-file lint, publicApi/packageExports guards.
- Candidate limit/resume and uncertain POST behavior; hash invalidation; rig compatibility; decoder failure; resource ownership; stale swaps.
- Android/iPhone/integrated-GPU evidence; 15-minute mobile run, 30 room transitions, 100 outfit swaps and context recovery.

## 완료 조건

- [ ] Manifest, budget profiles, quality gates and compatible catalog source
- [ ] Local doctor/generate/resume/build/validate/approve/publish tools
- [ ] Approved reference character/sofa/tree, then remaining assets
- [ ] Meshopt/KTX2, LOD and resource lifetime integration
- [ ] Review scene and product integration
- [ ] Device evidence and publication

## External prerequisites

- Initial inspection: MESHY_API_KEY is absent; approved reference images have not been provided. Do not fabricate generation, art approval or device measurements.

## Current art direction and progress

- Latest user-provided cream/pink bunny SD character sheet supersedes the silver-haired fantasy reference. Use a roughly two-head silhouette, round cheeks, large muted mauve eyes, sculpted ivory/blush hair, soft cream clothing and chunky shoes. Bunny hat and bag are removable parts. This is direction approval, not approval of any generated GLB.
- Previous base concept is retained locally at `.asset-work/references/character-base-v2.png` for history, not as the current production target. Latest reference-derived image generation failed with a network error; no replacement image was produced.
- Manifest gates and compatibility tests pass; developer review has hash verification, primary/fallback selection and blocks evidence export until the selected GLB loads. Meshopt validation decodes before semantic inspection.
- Still pending: actual authored character/rig/reference assets, KTX2 encoding/decoder delivery, runtime LOD/shared ownership integration, visual browser checks and real-device evidence. Do not close this epoch or publish assets on the strength of unit tests.

## Desktop browser diagnostic — 2026-09-09 KST

- Local studio execution slice: loopback HTTP server owns provider credentials and execution; browser is a command/status projection. Existing CLI candidate journals remain canonical, new image tasks use persistent idempotent request IDs. No public runtime API/export changes. Origin/header/body-size gates prevent arbitrary websites from triggering local paid generation or Blender execution.
- Implemented Meshy text-to-image and approved five-category Image-to-3D request/resume UI, generated-image reference selection, and actual Blender candidate import/save/export. Real Blender integration test passed with a legacy table fixture; not a new rabbit asset or rig approval. Live Meshy generation remains unexecuted because the current process has no API key.

- User narrowed immediate verification to this computer. Ran existing World and new asset review in Chromium 139 on Windows, NVIDIA RTX 5060 Ti via ANGLE D3D11 (review backend WebGL2). Initial SwiftShader attempt excluded from hardware results.
- Existing server on 5173 belongs to another project and was preserved. Started this repository on 127.0.0.1:5188.
- Meshopt legacy table fixture rendered; 100 LOD/variant/silhouette UI changes completed; forced WebGL context loss restored and table remained visible. No captured console errors. These are not outfit swaps or new-character art acceptance.
- World settled screenshot visually confirms the current legacy scene renders. Initial-load 10-second RAF cadence was 43.34/s; this includes loading and is not a steady-state FPS/GPU benchmark or a 60 FPS pass.
- Evidence: `.asset-work/desktop-check-1788883267553/report.json`, `review.png`, `review-restored.png`, `world-settled.png`. Reproducer: `node scripts/assets/desktop-check.mjs` with this repo's Vite server on 5188.
- New reference character, room transitions, sustained benchmark, GPU resource budget/leak assertions, WebGPU and mobile-device certification remain unverified. No publication evidence was approved.
