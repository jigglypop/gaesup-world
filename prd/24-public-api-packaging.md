# PRD-24 공개 API와 패키징

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 트랙 | Epoch (공개 API 계약) |
| 선행 PRD | 00 |
| 후속 | 모든 PRD의 공개 API 삭제는 이 PRD의 2.0 절차를 따른다 |
| 감사 | `api-surface-guard` |

## 1. 배경과 문제

| ID | 내용 | 근거 |
|---|---|---|
| P-01 | 공개 표면 통제 무력: `export * from './core'` 뒤에 약 790줄 명시 re-export가 같은 `./core`에서 반복. 실제 공개 표면은 core 전체 | `src/index.ts:5` |
| P-02 | 공개 API 테스트가 소스 텍스트 정규식 검사. 실제 export 집합 스냅샷 없음 | `publicApi.test.ts:15-17` |
| P-03 | 서브패스 내용이 루트에서도 모두 노출. 격리가 아니라 별칭 | runtime, plugins, building, gameplay, network, assets, navigation |
| P-04 | `server-contracts`가 React 포함 | PRD-22 N-06 |
| P-05 | `./admin`이 `react-router-dom`을 쓰지만 peer에 없음 (devDependency에만 있고 vite external) | `src/admin/store/checkStore.tsx` |
| P-06 | 패키지 `files`에 `public/gltf`(약 66MB) 포함 | `package.json` |
| P-07 | 데코레이터 부수효과 등록인데 `sideEffects`에 브리지 경로 없음. 소비자 번들에서 등록 누락 가능 (추정, `test:package`로 확인 필요) | `package.json sideEffects` |
| P-08 | `typescript` 별칭이 `@typescript/typescript6`, `@typescript/native`가 `typescript@7`로 뒤바뀌어 혼동 | `package.json` devDependencies |
| P-09 | `deploy` 스크립트가 `gh-pages -d dist`로 라이브러리 출력물 배포 (데모 배포 의도와 불일치 추정) | `package.json` |
| P-10 | `policy:dev`가 존재하지 않는 `server/` 참조 | `package.json` |

## 2. 목표 / 비목표

### 목표
1. 공개 표면의 원본을 하나로 정한다: **명시적 export 목록**.
2. 실제 런타임 export 집합을 스냅샷으로 가드한다.
3. 서브패스는 역할별로 격리하고 루트는 코어만 노출한다.
4. 2.0에서 누적된 삭제를 한 번에 반영하고 마이그레이션 가이드를 제공한다.

### 비목표
- 모노레포 전환(패키지 분할). 서브패스로 충분한지 2.0 이후 재평가.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | `src/index.ts`에서 `export *` 제거. 명시 목록만 유지 |
| FR-2 | 스냅샷 테스트: 빌드된 `dist/index.js`와 각 서브패스의 `Object.keys(module)` 정렬 목록을 커밋된 스냅샷과 비교. 변경 시 의도적 갱신 필요 |
| FR-3 | 서브패스 역할표 확정 (4절) |
| FR-4 | `sideEffects` 정확화: 브리지 등록이 부수효과를 쓰면 해당 경로 포함. PRD-13 이후에는 부수효과 제거로 `sideEffects: ["**/*.css"]`만 |
| FR-5 | peer 정리: `react-router-dom`을 optional peer로 두거나 admin에서 의존 제거 |
| FR-6 | `files`에서 데모 에셋 제거 (PRD-20) |
| FR-7 | 스크립트 정리: `policy:dev` 삭제, `deploy`를 데모 빌드(`demo-dist`) 대상으로 수정 또는 삭제 |
| FR-8 | deprecated 표기 규칙: JSDoc `@deprecated` + 최초 호출 시 `logger.warn` 1회 |
| FR-9 | 2.0 마이그레이션 가이드 `docs/migration/2.0.md` |

## 4. 서브패스 역할표 (제안)

| 서브패스 | 역할 | React | 비고 |
|---|---|---|---|
| `.` | 코어 런타임: scene-object, runtime, frame, character, camera, input, save | O | 루트는 게임 제작 최소 세트 |
| `./editor` | 에디터 셸, 패널 | O | |
| `./building` | 건설 도메인 | O | PRD-10 이후 SceneDocument 기반 |
| `./scripting` | 스크립트 API | 일부 | PRD-12 (신설 여부 열린 질문) |
| `./assets` | 에셋 메타, 로더 | O | |
| `./navigation` | 경로 탐색 | X (코어) | |
| `./gameplay` 또는 `./kits/cozy` | 생활형 킷 | O | PRD-23 |
| `./network` | 멀티플레이 킷 | O | PRD-22 |
| `./server-contracts` | 서버 계약, 순수 명령 핸들러 | **X** | 가드 테스트 필수 |
| `./blueprints`, `./blueprints/editor` | 비주얼 스크립트 | O | |
| `./postprocessing` | WebGL 호환 후처리 | O | PRD-19에서 재정의 |
| `./next` | 실험 코어 | - | 안정성 보장 없음 명시 |
| `./admin` | 관리 킷 | O | optional peer |
| `./runtime`, `./plugins` | 루트와 중복 | - | 루트로 통합하거나 역할 재정의 |

## 5. 단계별 작업

| Slice | 내용 | 완료 기준 |
|---|---|---|
| 24-a | 실제 export 스냅샷 테스트 도입 (현재 상태 그대로 스냅샷) | 테스트 추가, 기존 테스트 유지 |
| 24-b | 스크립트·별칭 정리 (P-08, P-09, P-10) | 사용자 확인 후 |
| 24-c | `server-contracts` 가드 테스트 (PRD-22 22-b와 같이) | react 미로드 |
| 24-d | `sideEffects` 검증: `test:package`에서 브리지 등록 확인 | 통과 |
| 24-e | admin peer 정리 | publint 통과 |
| 24-f | 서브패스 역할표 확정과 루트 축소 설계 (2.0 브랜치) | 설계 문서 |
| 24-g | `export *` 제거, 명시 목록, 스냅샷 갱신 | api-surface-guard |
| 24-h | 2.0 마이그레이션 가이드와 릴리스 | `pnpm verify:full` |

## 6. 검증과 완료 기준

- `publicApi.test.ts`, `packageExports.test.ts`, 신규 스냅샷 테스트
- `pnpm verify:full` (publint, package 소비, demo)
- `api-surface-guard` 감사

## 7. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 루트 축소로 사용자 코드 대량 깨짐 | 1.x에서 서브패스 경로 먼저 제공, deprecated 경고, 2.0에서 제거 |
| 스냅샷 테스트 잦은 갱신 부담 | 스냅샷 diff를 PR 설명에 자동 첨부 |

## 8. 열린 질문

1. 2.0 릴리스 시점과 1.x 유지 기간.
2. `./runtime`, `./plugins`를 루트로 합칠지.

## 구현 현황 (2026-09-23, 3차)

| Slice | 상태 | 내용 |
|---|---|---|
| 24-a | 완료 | `src/__tests__/exportSnapshot.test.ts`: `package.json` exports의 JS 엔트리 15개 전부를 jest 별칭으로 로드해 `Object.keys` 정렬 목록을 스냅샷(`__snapshots__/exportSnapshot.test.ts.snap`)으로 고정. 엔트리 목록과 `package.json` exports 일치도 검사. 현재 루트 약 950개, 전체 1,538개. 변경 시 `jest -u`로 의도적 갱신 |
| 24-c | 완료 | PRD-22 22-b의 가드 테스트와 `pnpm check:entries` |
| 나머지 | 미착수 | 24-b, 24-e는 사용자 확인 필요 |

스냅샷은 빌드 산출물(`dist`)이 아닌 소스 엔트리 기준이다. 빌드 후 표면은 `test:package:built`가 검증한다.
