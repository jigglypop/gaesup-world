# Epoch 8a: Blender character parts pipeline

## 목표와 범위

- 바꾸는 boundary: 캐릭터 파츠 asset의 source of truth. 수작업 GLB와 `placeholder: true` seed 항목 → `scripts/build-character-parts.cjs`가 Blender headless(`scripts/blender/gaesup_parts.py`)로 `ally_body.glb` armature를 공유하는 파츠 GLB와 `public/gltf/parts/manifest.json`을 생성하고 rig 호환성을 검증한 결과. canonical path는 build script → manifest → `seedAssets.ts` 등록이며, 기존 recolor 스크립트(`generate-local-character-glbs.cjs`)는 `scripts/lib/glb.cjs`를 공유하는 병행 경로로 남긴다.
- 첫 slice 산출물: `bottom`(pants), `shoes`, `weapon`(sword). 손·발 본이 없는 현재 rig에서는 다리 체인 최하단 마디를 신발, 오른팔 말단 본 tail을 무기 소켓으로 쓴다. 무기는 rigid 소켓 런타임이 없으므로 오른팔 본에 100% 웨이트를 준 SkinnedMesh로 export해 기존 공유 스켈레톤 경로를 그대로 탄다.
- 제외: 본 소켓 부착 런타임(`PartsGroupRef`), `ally_body.glb` 재export나 `hideBodyRegions` 노드 분리, Meshopt/KTX2/LOD/collider 메타데이터, NPC 파츠 통합, live Blender MCP, 새 public API.
- 리스크: Blender glTF exporter의 joint 순서가 body와 다르면 `remappable`로 떨어진다(런타임 지원). Blender 미설치 환경에서는 빌드 스크립트를 실행할 수 없으므로 생성 GLB와 manifest를 커밋해 guard test가 항상 돌게 한다.

## 검증

- `node scripts/build-character-parts.cjs --inspect` / `node scripts/build-character-parts.cjs`
- `pnpm test -- src/core/assets src/core/character --runInBand`
- `pnpm exec tsc -p tsconfig.build.json --noEmit`, `pnpm exec eslint <changed>`
- public API 변경 없음: `publicApi`/`packageExports` 가드는 회귀 확인용으로만 실행

## 완료 조건

- [ ] `pnpm assets:parts`가 Blender headless로 pants/shoes/sword GLB와 manifest를 생성하고 body와 skeleton 호환(identical/remappable)을 검증한다.
- [ ] seed 카탈로그의 bottom/shoes/weapon 항목이 placeholder 대신 생성 GLB URL과 `skeleton`/`deformation` 메타데이터를 가진다.
- [ ] guard test가 manifest ↔ seed 정합성과 GLB skin joints ⊆ body joints를 고정한다.
- [ ] `/world` CharacterMenu에서 생성 파츠를 장착하면 `PartsGroupRef` 공유 스켈레톤 경로로 렌더된다(examples 변경 없이 도달).
- [ ] 검증 실행·통과, HARNESS.md 기록 append
