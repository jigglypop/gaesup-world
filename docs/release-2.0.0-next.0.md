# 2.0.0-next.0 — 미니홈피 프리뷰 / Mini-home preview

작업 버전입니다. npm과 사이트 배포 결과는 실제 조회와 검증 로그로 별도 확인합니다. / This is the working release. Registry and site publication must be confirmed separately from live results.

## 한국어

- 방·프로필·글의 통합 실행 취소/다시 실행, 자동저장, 이전 정상 백업 복구, 다른 탭 저장 충돌 보호.
- 검증된 JSON 가져오기/내보내기, 다이어리·방명록을 제외하는 방 공유 사본, GLB 내보내기.
- Unity 장면 JSON API와 Editor 교환 스크립트. 실제 Unity 실행은 미검증.
- 계층 위치·회전·크기 합성을 수정하고 exact world matrix API 제공. shear/singular 합성을 TRS로 조용히 손실 변환하지 않음.
- WebGPURenderer 공식 flag 판별과 fire/bloom node 경로 연결, 정지한 미니룸의 불필요한 draw 억제.
- 잘못된 Jest 실행 인자, 사라진 하네스 경로, 다른 test runner 혼용, 오래된 route 검사와 누락된 기존 asset 복구.
- demo-dist를 배포하도록 수정하고 경로·404 fallback·version.json을 추가. 한국어/영어 사용자 문서 제공.

1.x에서 이전할 때: root와 subpath consumer를 다시 빌드하세요. 계층 transform은 이전의 잘못된 단순 합산과 결과가 달라집니다. shear가 있으면 `getWorldMatrix`를 사용하세요. 미니홈피 v1 저장 형식은 유지합니다. 최신 정식 버전을 자동 교체하지 않도록 next tag로 검증합니다.

## English

- One undo/redo history across room, profile and notes; autosave, previous-save recovery and cross-tab conflict protection.
- Validated JSON backup/import, room/profile snapshot links that omit private notes, and GLB export.
- Unity scene JSON APIs and Editor bridge scripts; actual Unity execution remains unverified.
- Correct hierarchical TRS composition and exact world matrices. Shear/singular composition is not silently reduced to lossy TRS.
- Official WebGPURenderer flag detection, connected fire/bloom node paths and fewer unnecessary draws in idle mini-rooms.
- Repaired Jest arguments, missing harness entry, mixed test runners, obsolete route check and missing legacy assets.
- Correct demo-dist publication with base path, 404 fallback, version.json and Korean/English documentation.

Migrating from 1.x: rebuild root/subpath consumers. Hierarchy results change because the old addition-only composition was incorrect. Use `getWorldMatrix` for shear. Mini-home v1 saves remain supported. Validate the next tag before replacing a stable installation.

## 검증 기록 / Verification record — 2026-09-19

- `corepack pnpm run verify:full`: 290 suites / 2,624 tests passed; one suite/test intentionally skipped. Memory checks: 5 suites / 88 tests passed. Asset tools: 6 tests passed. Type builds, publint, ESM/CJS package consumers and demo build checks passed.
- 공유받는 사람의 기존 글과 실행 취소 이력을 지키는 추가 수정 후 session 3개 테스트, ESLint, typecheck와 Chrome probe를 다시 통과했습니다. / After the recipient-note/history fix, all 3 session tests, scoped ESLint, typecheck and the Chrome probe passed again.
- 실제 Chrome: WebGPU / WebGL2 fallback, 편집·새로고침 복구, 백업 가져오기, 저장 손상·용량 오류, 공유 사본·기존 글 보존, 모바일 가로 넘침 없음. 정지 상태 700ms의 추가 draw는 0, GLB validator 오류는 0이었습니다. / Actual Chrome covered both renderers, edit/reload recovery, backup import, corrupt/quota failures, shared snapshots, recipient notes and mobile layout. Idle draws in 700 ms: 0; GLB validation errors: 0.
- Unity Editor 컴파일·실행과 원격 방문/계정 저장은 이 결과에 포함하지 않습니다. / These results do not cover Unity Editor execution, remote visits or account-backed persistence.

배포 확인은 `version.json`의 커밋과 npm registry 조회로 별도 수행합니다. `npm publish --dry-run` 성공은 실제 업로드 성공이 아닙니다. / Verify deployment separately using the site's `version.json` commit and the npm registry. A successful publish dry run is not an uploaded release.
