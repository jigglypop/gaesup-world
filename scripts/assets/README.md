# Local production asset tools

Official API reference: https://docs.meshy.ai/en/api/image-to-3d.

Run `corepack pnpm assets:production <command>` from the repository.

- `doctor`: inspect Blender, local Meshy authentication and compression readiness.
- `generate <chair|table|sofa|planter|tree> <image> <approval.json>`: reserve one of two persistent candidate slots and submit once. Reference approval needs `sha256`, `decision: "approved"`, and `reviewer`. Set `MESHY_API_KEY` in the local process; never put it in a manifest or browser code.
- `resume <job.json>`: query an existing task and download its GLB. An uncertain submission without a task ID requires provider-side reconciliation; do not delete the journal to trigger another paid request.
- `build <source.blend> <output> <specification.json>`: use `GAESUP_BLENDER` or the pinned Windows Blender 5.2 executable. The source must contain authored `LOD0`, `LOD1`, `LOD2` collections. Use a new output directory. Specification supplies identity, source, colliders, sockets and optional rig metadata; build supplies artifact hashes, bounds, LODs and materials.
- `validate <directory>`: verify manifest, contained artifact paths, hashes, GLB integrity and decoded Meshopt semantics. This does not approve artistic quality or attest rig compatibility.
- `approve <directory> <provenance|technical|art|browser> <evidence.json>`: record hash-bound evidence.
- `publish <directory>`: require all four current evidence gates, stage an immutable version, then replace the catalog last. Retrying after a failed catalog update is supported if the version and evidence are unchanged.

Publication is serialized by `public/production-assets/.publish.lock`. A process crash can leave this lock. Inspect its PID and confirm no publisher is active before manually removing that exact lock file. Staging directories are retained on failure for inspection. Never overwrite an existing published version; create a new version for changed files or evidence.

Local originals and drafts belong in ignored `.asset-work/`. Only approved deliveries enter `public/production-assets/`. Legacy seeds remain independent and are not implicitly certified by this workflow.

## Not complete yet

KTX2 encoder/decoder deployment, runtime resource sharing and LOD integration, actual character/rig/reference models, browser visual verification and physical-device evidence remain pending. Current textured output uses resized PNG fallback and reports KTX2 as not built. A successful command or unit test is not a production approval. Synthetic test evidence is written only in temporary test directories.

Current art direction is the user's cream/pink bunny SD reference: round cheeks, large mauve anime eyes, sculpted ivory/blush hair, short limbs and soft clothing. Hat and bag are removable parts. The previous silver-haired concept is historical, not the active target.
