# PRD 실행 기록

기준: 2026-09-21, [전체 PRD](PRD-web-engine-2026-09.md). 사용자 목표는 PRD 전체 실행이며 계속 진행 중이다. 아래 구현은 전체 완료 판정이 아니다. 기존 dirty 변경을 유지한 상태로 작업했다. 원격 main은 시작 HEAD `ccd2767413edbf29744b64abe6d068b28967cd74`와 같고, 이번 변경은 아직 commit/push/publish하지 않았다.

## 이번 구현과 검증

| 요구사항 | 변경·증거 | 남은 범위 |
| --- | --- | --- |
| PERF-01 | `audit:core` 추가. 최초 자동 분류 1,180 TS 모듈 / 실행 794 / 64 그룹. 각 파일 hash·import·정적 검토 단서 기록 | 정적 목록은 감사 완료가 아님. 모든 실행 모듈의 수동 판정·측정·비용 순위 필요 |
| R20 / OPT-01 | 비계층 단일 객체 변경에 불변 구조 공유. 외부 입력 검증·재부모화 전체 검증 유지. subtree 수집을 인접 목록으로 변경 | 생성·삭제·component 변경·계층 검증 비용, 전체 편집/undo 부하 측정 |
| R20 재현 | `/performance`에 실제 controller `document-edit` 추가. 10k 객체 3회, 각 100 표본에서 p95 1.8–2.2ms | 이 측정은 짧은 기능/CPU 검사이며 정식 프레임 예산 인수 아님 |
| MH-06 | AvatarRuntime의 GLB body·장착 규약·3개 코디를 방에 연결. 걷기/idle, 실패 시 기존 코디 보존·재시도, GLB skin export | 장비 개별 선택, 물리 controller·실기기 터치·장시간 수명 |
| MH-07 / MH-10 | 조명·화질·시점·아바타·소리/볼륨을 기존 v1 저장·공유·undo/redo에 연결. 구 v1 기본값 이행 | 시간·날씨 도메인, 다중 슬롯·SaveSystem 제품 통합 |
| MH-09 | 실제 AudioEngine의 BGM·SFX·볼륨 UI. 사용자 클릭 전 Context 생성 0, stop 후 source 0, 새로고침 autoplay 0 | 실제 가구·발걸음 소리, 숨김/종료/복원 경쟁 경로 추가 검증 |
| MH-01 / MH-14 | `features.ts`에 MH-02–14의 연결 상태·API·위치·잔여 범위. 진단 패널에 노출 | 전체 공개 기능군 인벤토리와 미노출 사유까지 확대 |
| REL-01 | OIDC 지원 발행 도구, 검증→발행→registry integrity→fresh consumer→동일 패키지 예제→Pages→live workflow 구현 | npm trusted publisher·Pages 설정 실확인, CI 실행·신규 발행·라이브 인수 |
| R17 / R29 | 설치 패키지 예제에서 Three.js 중복 로딩으로 WebGPU 조명 소실 재현. `dedupe: three` 후 동일 11단계 캡처 정상 | 다른 peer 조합·WebGPU 장치·headless 경계·전체 backend 통합 |
| ENG-01 | 기존 E1–E3 범위 유지. 실제 prefab·playMode 모듈 존재를 추가 확인 | 전체 격차표를 기반 존재/제품 연결/실검증으로 다시 분해, 단계별 구현 계속 |
| R03 | 월드 높이 추정을 실제 Rapier 접촉 판정으로 교체. 공개 PhysicsEntity→useEntity→PhysicsBridge에 물리 월드·접촉 정책 연결. 고지대·경사·움직이는/회전하는 발판·삼각형 지형·점프·순간이동·큰 바닥 이동 검사 | 계단/실제 avatar·카메라를 포함한 전체 조작 여정, React/R3F/Rapier peer matrix, 실기기·전체 프레임 예산 |
| R04 | 월드 AABB 인덱스, 최근접·거리 제한·정규화 ray, 큰 물체 충돌, bounds 갱신/삭제/overflow 처리. 극단 반경·좌표의 중심점 검색도 반복량 제한 | 밀집·장거리 광선의 후보 비용, 실제 게임 장면·장치별 프레임 예산 |
| R05 | 렌더 전 메시와 같은 프레임 장면 변경 반영, 반환값 소유권, 구/삼각형 연속 충돌. instance/batch/skinning/morph와 명시적 아바타 제외 검사 | 실제 컨트롤러 이동/보간 전체 경로, 복잡 메시의 가속 구조, Three 지원 조합·실기기 |

## 접지 후속 구현 — 2026-09-21

- `GroundContactProbe`는 같은 Rapier 월드의 접촉 후보를 사용한다. 접촉점·표면 법선·현재 collider pose·양쪽 접점 속도로 지지를 판정하고 센서·비활성 객체·충돌/solver 그룹을 검사한다. 높이·작은 수직 속도를 접지의 대용으로 쓰던 규칙은 제거했다.
- `PhysicsEntity`의 기본 연결과 직접 `usePhysicsBridge`/`PhysicsSystem` 사용 경로를 구분해 [접지 연결 문서](physics-grounding.md)를 추가했다. 직접 호출자는 `physicsWorld`를 전달한다. 점프 직후 두 접지 상태를 같은 주입 manager에서 해제하며, 별도 manager를 가진 `ImpulseComponent`가 외부 상태를 바꾸지 않는 기존 계약을 유지한다.
- 실제 Rapier baseline: `.artifacts/performance/2026-09-21T11-32-29-227Z`, `b5d2c50a-ccf7-49f6-93ff-4afb26018749`, 오판 7건. 앞선 `11-32-11-104Z`의 metric scope 변경 오류는 하네스 실패이며 알고리즘 baseline으로 사용하지 않는다.
- 최종 동작 후보: `.artifacts/performance/2026-09-21T12-04-46-739Z`, source `d3e540be8d5cffe9b1492f5c791658bb7dfe4bc54064945b4d15f60c9a610962`. `locomotion` v1 3회 모두 오판 0, 대표 run `894f4dc9-beb2-42d9-9ebe-4b1e196f6da6`. `entity-grounding` v2도 3회 모두 오판 0, 대표 run `a88ec357-8f97-4c2d-9e71-dfb34b5810cd`. 실제 공개 entity 연결에서 착지·점프·입력 유지/재입력·접촉 정책·순간이동·재착지를 검사했다. native WebGPU/NVIDIA, page errors 0. 이후 source 변경은 import 정렬·주석과 증거 UI/문서 반영이다.
- 삼각형 지형에서 `contactCollider`가 null을 반환하는 경우와 큰 바닥에서 새 형상 질의가 부정확한 경우를 재현했다. 현재 solver 접촉점을 재사용하고 이동으로 달라진 표면은 해당 collider의 짧은 ray/shape query로 확인한다. 넓은 지형의 정지·빠른 이동 회귀를 포함한다. stale contact를 무조건 신뢰하거나 전체 월드로 지면 ray를 쏘지 않는다.
- Rapier `SolverFlags.EMPTY`는 impulse를 끄더라도 manifold에 solver contact를 남길 수 있으며 공개 API에 flags getter가 없다. 사용자 정의 감지 전용/단방향 정책은 `groundContactFilter`로 공유한다. null 필터와 EMPTY+공유 정책을 실제 EventQueue/physics hook으로 검사했다. 자동 필터 해석을 구현했다고 주장하지 않는다.
- `.artifacts/performance/grounding/2026-09-21T12-04-46-350Z`는 Rapier 0.12.0/0.19.2 각각에서 mesh·teleport·solver-group·넓은 지형 이동 검사와 100/1,000개 actor 질의를 실행했다. 두 버전 실패 0. 브라우저/전체 검사와 함께 실행한 탐색 CPU 기록이며, 지원 React 조합 전체 검사나 통제된 A/B·FPS 예산 인수를 대신하지 않는다. 초기 무중력 규모 fixture의 solver contact 미생성 사례와 실제 질의 누락 로그를 보존하고 중력 하에서 60 step 정착 후 측정하도록 정정했다.
- 설치 패키지 소비자 검사에 실제 Rapier world와 공개 PhysicsSystem을 사용하는 ESM/CJS 착지·점프·teleport 검사를 추가했다. 전체 인수 상태는 아직 `working`이며 R03 accepted run은 지정하지 않는다.
- 최종 접지 코어 검증: `.tmp/prd-grounding-verify-full-final.log`, exit 0. 일반 341 suites / 2,941 tests, 기존 1 suite / 1 test skip; 메모리 5 suites / 88 tests; build·publint·strict declarations·fresh ESM/CJS physics consumer·demo 통과. 앞선 import 순서와 Layer 1 의존성 검사 실패 로그도 보존했다. 새 직접 의존성을 허용 목록에 넣는 대신 `PhysicsCalcProps`의 기존 타입 계약을 재사용했다.
- 성능 실험실의 effect가 재실행될 때 카메라를 원점으로 다시 향하게 해 높은 발판이 화면 밖으로 나가는 현상을 캡처했다. 초기 시점 설정을 Canvas 생성 시점으로 옮겼다. 수정 전 `.artifacts/performance/2026-09-21T12-07-31-568Z-grounding-visual`, 수정 후 `2026-09-21T12-11-00-928Z-grounding-visual`의 발판/점프 이미지와 성공 run `4c0e68f9-81e8-499e-a34a-ae872ee2e6fd`를 확인했다. 이 후속 예제 변경은 타입·대상 lint·브라우저 실행으로 별도 검증했다.
- 초기/최종 native 기록 7개를 `2026-09-21-s3-grounding.json`에 연결했다. 전체 lab UI 검사는 `.artifacts/performance/lab-ui-2026-09-21T12-11-43-698Z`: R03 7→0 표시·공개 entity 결과·5회 요약·JSON 입출력·IndexedDB 재로드 통과.
- 후속 R05 재현: `.artifacts/performance/2026-09-21T12-14-15-692Z-camera-interpolation`. 빌드된 공개 ThirdPersonController에서 `(4,0,8)`→`(-4,0,8)` 보간의 실제 위치 `(0,0,8)`이 벽 내부가 된다. 목표점의 충돌 검사 성공으로 실제 보간 위치의 안전성을 보장할 수 없음을 확인했다.
- `BaseController`에서 다음 프레임 위치를 먼저 보간하고, focus→그 위치의 구 충돌을 검사한 뒤 카메라 위치·방향에 반영한다. 충돌 질의는 프레임당 1회이며 scratch Vector3는 controller별로 소유한다. 장애물 뒤 목표점 때문에 아직 장애물에 도달하지 않은 카메라가 미리 느려지던 기존 테스트는 실제 이동 후 벽 앞에 유지되는 조건으로 변경했다. 일반/포커스 모드의 중간점 벽 겹침 회귀를 추가했다.
- R05 `camera-smoothing` v2: `.artifacts/performance/2026-09-21T12-19-17-981Z`, source `91efc42703437ec33f78a9404ea5c58a68aa16ab17ee8f501f896945108151d3`, 대표 run `738d183a-a41b-4194-9939-189c346f2b51`. 30/60/144Hz·좌우 전환·focus 전환의 720개 프레임을 독립 Box3/ray 기준과 대조했다. 3회 모두 겹침/시야 차단 0, camera 16 suites / 118 tests 통과. 이는 브라우저 CPU 기능 검사이며 GPU backend를 사용하지 않는다. 연속된 프레임 사이 이동 구간·초기 관통 탈출·실제 avatar 장면·복잡 메시 가속·peer/장치별 전체 예산은 계속 남아 있다.
- R05 수정까지 포함한 `verify:full`: `.tmp/prd-grounding-camera-verify-full.log`, exit 0. 일반 341 suites / 2,943 tests, 기존 1 suite / 1 test skip; 메모리 5 suites / 88 tests, build·publint·strict ESM/CJS 소비자·실제 설치본 접지/점프/카메라 보간 검사·demo 모두 통과했다. 패키지 버전은 여전히 1.0.31이며 새 npm 발행은 하지 않았다.
- 같은 공개 controller 재현의 재빌드 결과: `.artifacts/performance/2026-09-21T12-24-33-059Z-camera-interpolation`. 실제 위치가 `(0,0,6.25)`로 보정되어 벽 겹침·시야 차단이 모두 false다. 앞선 `12-23-44-131Z` 기록의 `actualViewBlocked`는 구 sweep의 경계 접촉까지 차단으로 세었으므로 시야 판정 근거로 쓰지 않는다. 수정된 재현기는 독립 Ray/Box3와 구 반경 여유를 구분하며 fixture와 실행 스크립트를 함께 보존했다.
- 최종 연결 회귀: `.artifacts/performance/2026-09-21T12-23-22-377Z`, source `792d5c9a8973509da70096850181edcaf96eb425766582975e023c0ac85a0fe0`. 제어된 게임패드 입력을 실제 Rapier/WebGPU 카메라에 연결한 `1eb03746-c2f5-4616-bf54-132caff060ba`와 cinematic 수명 `9d77a654-2a20-42dc-b4e4-eb73672c6a7b`가 통과했다. 실제 USB/Bluetooth 입력 장치 검사는 아니다. 최신 lab UI·보간 결과·5회 요약·입출력/재로드도 `.artifacts/performance/lab-ui-2026-09-21T12-23-22-409Z`에서 통과했다.
- 갱신 인벤토리: `.artifacts/performance/inventory/2026-09-21T12-22-54-816Z`, TS 모듈 1,186 / runtime 797 / 64 groups. 전수 수동 감사와 최종 인수는 계속 진행 중이다.

### 접지·카메라 비용 검토

| 코드 경로 | 현재 비용 구조·소유권 | 다음 확인할 병목 |
| --- | --- | --- |
| `PhysicsSystem.calculate/checkGround` | actor 갱신당 접지 probe 1회. 높이/안정 횟수 추정 상태 제거. 실제 접촉을 movement/animation 상태에 전달 | 렌더 주기와 물리 fixed step 중복, rigid-body 설정 반복은 R26 공통 clock 작업에서 함께 계측 |
| `GroundContactProbe.read` | actor collider별 contact graph 후보, 후보별 manifold/접촉점. scratch vector/quaternion·callback은 probe 소유. 세계 전체 지면 검색 없음 | actor마다 `propagateModifiedBodyPositionsToColliders` 호출, Rapier 반환 vector·WASM 호출 비용은 밀집/다중 collider 장면에서 추가 분해 필요 |
| `GroundContactProbe.inspectManifold/inspectOther` | 가까운 solver witness 우선. 이동 시 해당 표면 ray, 필요 시 pair contact/shape cast. 복합 지형·큰 바닥의 정확성 회귀를 검증 | 많은 접촉점·복잡 지형의 fallback 빈도와 비용은 아직 확정 병목으로 판정하지 않음 |
| `usePhysicsBridge.executePhysics` | calc props/input 참조를 재사용하며 world·filter 교체를 반영. 기본 entity의 world 전달을 실제 브라우저에서 검사 | 다수 entity·물리 updateLoop 조합의 중복 frame 비용, runtime clock 통합 필요 |
| `BaseController.update` | 보간된 frame 위치에 구 충돌 1회. controller별 scratch 1개 추가, 보정된 위치에서 회전 계산 | 질의 자체의 scene/triangle 순회가 규모 비용의 주요 후보. 프레임 간 이동 제약을 추가할 때 질의 횟수·정확성·시간을 함께 비교 |

이 표는 위 경로의 코드 검토 기록이다. 전체 자동 인벤토리의 수동 검토 완료나 모든 비용의 프로파일링 완료를 의미하지 않는다.

## 공간 검색·카메라 후속 구현 — 2026-09-21

- 재현 baseline: `.artifacts/performance/2026-09-21T11-01-19-009Z`. R04는 near 대신 far 선택·큰 AABB 충돌 누락 1건, R05는 렌더 전 장애물 누락·이전 반환 위치 2단위 변조가 발생했다.
- 동일 native WebGPU 시나리오 수정 실행: `.artifacts/performance/2026-09-21T11-12-42-091Z`, 각 3회 오류 0. 대표 R04 `ebfd9e1c-ccd0-4e97-9635-42b0efb4a1e2`, R05 `c9751cac-eb68-4eba-a343-4d5d82404e15`.
- `spatial-scale` v2: 1만 객체, 이동 120회와 충돌/최근접 ray 결과를 실제 WorldSystem과 선형 기준 구현으로 대조. 20회 warmup 이후 100개 표본, 질의 32회 묶음 평균. 3회 모두 결과 일치. ray p95 약 0.00625ms, 선형 기준 약 0.150–0.194ms. 짧은 질의의 0ms 표본은 타이머 해상도 미만이며 비용이 없다는 뜻이 아니다.
- `camera-radius` v1: 중앙 ray가 빗나가는 옆면 접촉·반경·이전 반환값 보존을 1만 메시에서 검사. 불필요한 raycast/역행렬·부모 갱신을 줄이기 전 중앙값 4.0–4.1ms, 이후 2.6–3.0ms. 각 3회 탐색 측정이며 교차 A/B·정식 프레임 인수 수치가 아니다.
- 규모 측정 기록: `.artifacts/performance/2026-09-21T11-13-13-774Z`와 `2026-09-21T11-15-46-033Z`. 후자 source hash `0292512c560f7d6fc9a0cd182dd68d6d7c9d946d9c7ae00916a1406bddcb4f01`. 이후 중심점 극단 질의·접점 거리 계약·공개 import 수정은 이 측정 snapshot에 포함되지 않는다.
- 회귀 검사는 실제 코드를 사용한다. 임의 방향 삼각형 200개를 별도의 거리 최소화 기준과 대조하고, 접면·모서리·꼭짓점·접선·초기 겹침·부모 스케일·삭제된 batch ID·bone/morph 변경을 검사한다. 기존 자기 모델 테스트는 실제 avatar의 제외 규약과 동일하게 명시적 `excludeObjects`를 전달하도록 수정했다. 위치만으로 물체를 자기 모델이라고 추정하지 않는다.
- `/performance`에 두 신규 시나리오와 전후 raw run 10개를 연결했다. 상태는 R04/R05 모두 `working`, 정식 인수 run은 미지정이다.
- 첫 전체 검증은 신규 예제의 내부 경로 import 1건을 검출했다. `gaesup-world/runtime` 공개 entry로 수정한 뒤 `verify:full`이 성공했다: 일반 340 suites / 2,921 tests, 기존 1 suite / 1 test skip, 메모리 5 suites / 88 tests, build·publint·fresh consumer·demo 통과. 실패 로그 `.tmp/prd-spatial-verify-full.log`와 수정 후 로그 `.tmp/prd-spatial-verify-full-fixed.log`를 모두 유지한다.
- 추가 스킨 메시 root 이동 검사에서 attached bind inverse가 렌더 전 갱신되지 않아 이동이 이중 적용되는 문제를 재현했다(기대 7.1, 관찰 8.1). `SkinnedMesh.updateMatrixWorld` 경로로 수정하고 전체 camera/world 관련 21 suites / 177 tests를 재검증했다. 예외 경로를 포함해 임시 메시·교차점 배열을 비운다. 최종 타입·lint도 통과했다.
- 최종 소스 native WebGPU 재검사: `.artifacts/performance/2026-09-21T11-25-51-208Z`, R04 `8ff2b899-a31a-4d02-ad8c-0d1c63e2719a`, R05 `71f2450e-1cae-457c-b291-6664974b692b`, 둘 다 통과. source hash `0a493488e4e6135f62fa3cb9adc4d4bbe8d8a4db1e67e43a42b9b6dedc43d98c`.
- 비교 UI도 신규 bundle을 실제로 읽어 충돌 누락 1→0, 반환값 변조 2→0을 표시한다. `.artifacts/performance/2026-09-21T11-23-02-373Z-spatial-ui`의 DOM 검사·화면 캡처 확인, page errors 0. 최종 package consumer에는 실제 설치본의 최근접/range/큰 경계 상자와 카메라 반경/소유권을 ESM·CJS 양쪽에서 실행하는 검사를 추가했다. 최종 재빌드·publint·fresh consumer·demo까지 통과했다 (`.tmp/prd-spatial-package-final.log`, exit 0). 이는 로컬 tarball 검사이며 신규 npm 발행·라이브 배포가 아니다.
- 갱신한 자동 목록은 1,184 TS 모듈 / runtime 796 / 64 그룹이다 (`.artifacts/performance/inventory/2026-09-21T11-21-12-253Z`). 이 목록 전체의 수동 감사 완료를 뜻하지 않는다.

## 성능 결과

HEAD baseline과 수정 구현의 이름+transform 명령을 교대로 실행했다. 각 규모 5회, 매회 warmup 20건·측정 50건. 마지막 문서 동등성을 비교하고 원시 표본을 보존한다. Ryzen 5 7500F / Node 24.15.0. 렌더링 FPS나 모든 명령의 개선율로 일반화하지 않는다.

| 객체 수 | 변경 전 중앙값의 중앙값 | 변경 후 | 비율 |
| --- | ---: | ---: | ---: |
| 100 | 0.707ms | 0.027ms | 약 26배 |
| 1,000 | 7.039ms | 0.165ms | 약 43배 |
| 5,000 | 37.657ms | 0.868ms | 약 43배 |
| 10,000 | 75.808ms | 1.762ms | 약 43배 |

원시 기록: `.artifacts/performance/2026-09-21T10-55-15-559Z/scene-command-benchmark.json`. Candidate source hash `328b073fa8e49437665716125cb326f830c5817ac68165a78bc66298a3a6a3c9`. 이후 추가된 배포·진단 파일은 이 측정의 source snapshot에 포함되지 않는다.

브라우저 문서 편집 기록: `.artifacts/performance/2026-09-21T10-44-15-427Z`, run IDs `ba77651f-1782-4452-803a-ab589d1f6b3d`, `4846a646-7d31-4646-8f9f-10fa490c687a`, `88a5b9b1-274d-4ec5-a833-a111a0faec8b`.

## 검증 경계와 산출물

- `verify:full`: 일반 338 suite / 2,904 tests 통과, 기존 1 suite / 1 test skip. 메모리 5 suite / 88 tests 통과. build·publint·strict ESM/CJS/Vite 소비자·demo 검증 통과. 이후 추가 변경은 관련 검사·새 build/consumer로 확인했으며 최종 전체 검증은 릴리스 직전에 재실행한다.
- 최근 집중 검사: 장면 명령/미니홈피/AudioEngine 30 tests 통과. 20:00 KST 기준 최종 소스의 타입·전체 lint·diff whitespace 검사 통과. 기존 미니홈피 전체 probe도 19:59 KST에 result.json을 갱신했고 native/fallback 오류 0, GLB 오류 0, 저장/공유/모바일 경로 통과를 기록했다.
- 실제 설치 tarball 예제: `.artifacts/minihome/2026-09-21T10-52-09-572Z/result.json`. 아바타 3종·실패 복구·오디오·저장·undo·GLB 오류 0·이동/idle·6회 교체·모바일 overflow 없음. 당시 색 회귀는 아래 별도 시각 검사에서 발견했으므로 이 기능 검사만으로 시각 정상 판정하지 않는다.
- 조명 baseline 실패: `.artifacts/minihome/lighting-2026-09-21T10-56-23-926Z/manifest.json`, 검은 픽셀 약 22–43%.
- 조명 수정 후: `.artifacts/minihome/lighting-2026-09-21T10-56-52-668Z/manifest.json`, 같은 11단계 약 0–0.017%. 모바일 canvas 시각 검토 완료. dev 경로도 같은 시나리오 정상.
- 배포용 로컬 preview: `http://127.0.0.1:4174/gaesup-world/`, version.json의 `packageSource`는 `local-tarball`. 라이브 npm 발행본이 아니다.
- dev: `http://127.0.0.1:5174/`. 개발 서버와 preview는 이후 재개 시 포트·프로세스를 먼저 확인한다.
- 조명 진단에 game-visual-debugging 지침의 단계별 동일 조건 캡처를 적용했다. 설치된 game-dev CLI/adapter가 없으므로 game-dev sealed evidence는 없다.

## 다음 실행 순서

1. 최종 변경 lint/type·기존 미니홈피 전체 probe와 설치 패키지 조명 검사 유지. CI metadata·registry recovery·historical tag 경계를 검증한다.
2. MH-04/05/08/10/13: 실제 가구 asset·색/배치 정책·행동/NPC·슬롯·Unity 가져오기 구현. 기능 목록을 공개 entry 전수와 연결한다.
3. 기존 코어 R02/R25 복원·사용자 명령 경합의 진행 중 구현을 인수하고, R03 접지의 전체 조작/peer 검증→R05 전체 카메라 경로→clock·network→GPU→규모 감사와 개선을 이어간다. R03/R04/R05의 일부 경로와 R20 단일 명령 개선을 전체 인수로 계산하지 않는다.
4. React18/R3F8/Rapier1·React19/R3F9/Rapier2/Three 지원 조합, native WebGPU·WebGL·실기기·Unity 검증을 수행한다.
5. 검증된 범위를 커밋하고 원격 main·trusted publisher·Pages 설정을 확인해 실제 발행/CI/live 인수까지 진행한다. 온라인 서비스·E1–E3 전체 목표는 남아 있다.
