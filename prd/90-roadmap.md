# PRD-90 로드맵

작성일: 2026-09-25

## 1. 마일스톤

| 마일스톤 | 이름 | 목표 | 종료 조건(01 문서 6절) |
|---|---|---|---|
| M0 | 검증 체계와 기준선 | "고쳤다"를 판정하는 장치를 먼저 만든다. 측정을 오염시키는 기본값 결함과 미커밋 작업을 정리한다 | 모든 시나리오가 green 또는 known-red로 분류됨, S-H10·S-H11·S-B11 green, PR에서 세 체크가 실제로 돔 |
| M1 | 엔진 코어 | kernel, `EntityWorld`, `TransformSystem`, `SceneProjector`, `defineSystem`, `runtime.mode`, physics 서비스, headless 호스트 | S-H01~S-H08 green, 손 확인: Play → 조작 → Stop 후 씬 동일 |
| M2 | 렌더 추출과 building | RenderWorld, GPU 상주 경로, 가시성, 오버레이, 셰이더 워밍업, 비동기 에셋 표시, 절차 지형. 첫 소비자는 building | S-B03~S-B08, S-B12, S-H09 green, 손 확인: 1만 타일 칠하기 연타에 long task 0 |
| M3 | 도메인 이전 | 월드 오브젝트, NPC, 캐릭터, 카메라, 입력, 애니메이션, 원격 플레이어, 게임플레이 kit, 내비게이션, minihome 재구성, 에디터 구독·보조 캔버스 | S-B09, S-B11, S-B13, S-B14, S-H13 green, minihome 기능 probe 통과 |
| M4 | 에셋·씬·저장 | 로더·캐시 통일, AssetDB, 프리팹 revision, SceneManager, 저장 경로, undo 역연산 | S-H12, S-H15, S-H16 green |
| M5 | 에디터 | Hierarchy/Inspector 통합, Play 제어, 대형 패널 분할 | 손 확인: 모든 엔티티 표시, 필드 편집, undo가 그 변경만 되돌림 |
| M6 | 화질 | 품질 등급 확대, TSL 수렴, 라이트 프로브·라이트맵, 클러스터 조명, 룩 스택, 고사양 기능 | S-B10 green, 등급별 스크린샷·GPU ms 비교표 |
| M7 | 2.0 | `@deprecated` 제거, CJS 제거, peer·자산 정리, `quality` 기본 `auto` | 마이그레이션 가이드, export snapshot 갱신, 매트릭스 통과 |

## 2. slice 배치

### M0 검증 체계와 기준선

위에서 아래 순서로 한다. 같은 칸 안은 병렬로 할 수 있다.

| 순서 | Slice | 내용 |
|---|---|---|
| 1 | REN-07a, REN-08a | 미커밋 품질 프로파일·그림자 작업 마무리와 커밋(작업 트리를 깨끗하게 해야 이후 diff가 읽힌다) |
| 2 | VER-06a | 커밋 push, PR에서 CI가 실제로 도는지 확인, 트리거 브랜치 정리 |
| 3 | VER-01a, VER-02a, VER-08a, VER-08b | 엔진 카운터, headless 수용 러너, 깨진 probe 정리, 내부 경로 fixture 정리 |
| 4 | VER-03a, VER-04a, VER-05a | 브라우저 수용 러너(운영 빌드), `/accept`(PerformanceLab 확장), 기준 장면 확장 |
| 5 | VER-01b, DOM-03a, AST-06a, DOM-11a | 도메인 카운터, 측정을 오염시키는 기본값 결함 3건(NPC 정책 요청, 저장 skip, minihome 대기 루프) |
| 6 | VER-03b, VER-07a, VER-08c | ms 기준 파일, A/B 화면 비교, 1.x 표면 동결 게이트 |

M0 끝에 전체 시나리오를 돌려 `test/accept/budgets.json`과 known-red 목록을 확정한다. 이 목록이 이후 진행률 보드다.

### M1 엔진 코어

```
COR-01a(kernel) ─► COR-02a(EntityWorld) ─► COR-02b(컴포넌트 레지스트리) ─► COR-04a(SceneProjector)
                └► COR-05a(defineSystem) ─► COR-05b(D-10) ─► COR-06a(mode) ─► COR-06b(play copy) ─► COR-06c
COR-02a ─► COR-03a(TransformSystem) ─► COR-03b(보간)
COR-05a + COR-03a ─► COR-07a(physics 서비스) ─► COR-08a(headless 호스트)
COR-01a ─► COR-09a(서비스 키) ─► COR-09c(import 부수효과) ─► COR-10a(오류) ─► COR-10b(오류 타입·Result)
COR-02a ─► COR-02c(공간 인덱스 비교 벤치와 결정)
```

### M2 렌더 추출과 building

```
COR-03a + COR-05a ─► REN-01a(RenderWorld) ─► REN-02a(GPU 상주) ─► REN-03a(가시성)
                                           └► REN-05a(컴파일) ─► REN-05b(후처리)
REN-01a ─► REN-01b(meshRenderer, 오브젝트)
DOM-01a(store 분리) ─► DOM-01b(chunk 문서) ─► DOM-01c(파생 데이터) ─► DOM-01d + REN-01c(building 추출) ─► DOM-01e
REN-01c ─► REN-04a(오버레이), REN-10a·REN-10b(절차 지형)
COR-07a ─► COR-07b(건설 collider)
REN-06a(엔티티 단위 대기) ─► REN-06b(선로드), REN-11a(demand), REN-07b(프로파일 소비), REN-08b(그림자 갱신·계측)
COR-05c(스케줄러 밖 루프 0)는 M2 끝까지
```

### M3 도메인 이전

| 흐름 | 순서 |
|---|---|
| 월드 오브젝트 | DOM-02a → DOM-02b |
| NPC | DOM-03b → DOM-03c + REN-09a → REN-09b |
| 캐릭터 | DOM-04a → DOM-04b → COR-07c |
| 입력·애니메이션·카메라 | DOM-05a, DOM-06a, DOM-07a(병렬) |
| 네트워크 | DOM-08b → DOM-08c → DOM-08d → DOM-08e, DOM-08f·DOM-08g(병렬) |
| 스크립트 | COR-11a → COR-11b |
| kit | COR-09b → DOM-09a → DOM-09b, COR-09d |
| 내비게이션 | DOM-10a |
| 에디터 | EDT-03a~c, EDT-05a~c, EDT-06a |
| 렌더 잔여 | REN-12a, REN-12b(병렬) |
| 정리 | COR-12a → COR-12b, COR-07d(React 바디 이전 완료 후) |
| minihome | DOM-11b(마지막. 새 코어가 제품을 받치는지 확인) |

### M4~M7

| 마일스톤 | 순서 |
|---|---|
| M4 | AST-01a → AST-02a → AST-03a → AST-03b → AST-04a → AST-04b → AST-05a → AST-05b. AST-06b~d, AST-07a, AST-08a는 병렬 |
| M5 | EDT-01a → EDT-01b → EDT-01c, EDT-02a, EDT-04a |
| M6 | REN-13a(도메인별) → REN-14a + EDT-07a → REN-14b → REN-14c → REN-14d |
| M7 | PKG-02a~d, COR-09e의 legacy 제거, 공개 이름 정리(PKG-04e) |

### 병행 트랙(마일스톤과 무관, 작고 독립)

| Slice | 이유 |
|---|---|
| DOM-08a | 네트워크 정확성 결함(D-06, D-07)과 원격 모델 allowlist. 언제든 가능 |
| AST-01a | D-14(Draco GLB 로드 실패). M4 전에 해도 된다 |
| PKG-01a~g | 번들 경계. PKG-01g만 COR-09·COR-12 이후 |
| PKG-03a~d, PKG-04a~f, PKG-05a~e | 계층·코드 건강·툴링. PKG-03d는 COR-06(모드) 이후 |

## 3. 먼저 할 10개

| 순위 | Slice | 이유 |
|---|---|---|
| 1 | REN-07a, REN-08a | 작업 트리의 미커밋 변경이 테스트 2건과 품질 검사를 깨뜨리고 있다 |
| 2 | VER-06a | CI가 한 번도 실제로 돈 적이 없다. 이후 모든 판정의 전제 |
| 3 | VER-01a, VER-02a | 카운터와 headless 러너. S-H 시나리오의 기반 |
| 4 | VER-08a, VER-08b | 깨진 probe와 내부 경로 fixture. 코어를 바꾸기 전에 회귀 장치를 살린다 |
| 5 | VER-03a, VER-04a | 운영 빌드 측정과 `/accept`. 소유자가 직접 보는 화면 |
| 6 | DOM-03a | 기본 설정에서 NPC마다 없는 서버로 요청을 보낸다. 측정을 오염시킨다 |
| 7 | AST-06a | 변경 없는 autosave가 전 도메인을 직렬화한다 |
| 8 | DOM-11a | 대표 데모가 대기 중에도 매 프레임 그린다 |
| 9 | VER-05a | 기준 장면에 NPC·원격·편집·궤도·그림자 경로가 없다 |
| 10 | COR-01a | 엔진 코어의 첫 단계(kernel). 이후 모든 코어 작업의 전제 |

## 4. 결정 기록

이전 판에서 이어받은 결정과 3판에서 새로 정한 결정이다. 사용자가 바꾸면 이 표와 해당 문서를 함께 고친다.

| ID | 결정 | 관련 |
|---|---|---|
| G1 | 영속 world model 원본은 `SceneDocument`다. `EntityWorld`는 projection이다 | COR-02, COR-04 |
| G2 | 오류는 phase·명령·시스템 경계에서 잡고, 해당 콜백은 다음 프레임에도 실행한다. 항목별 첫 오류와 이후 초당 최대 1회 보고. production 기본 sink는 `console.error`, runtime `onError`로 교체 | COR-10 |
| G4 | 1.x에서 `verifyActor` 미지정 시 최초 1회 경고, 2.0에서 기본 거부(`trustActors: true`로 해제). visit channel에 transport가 채우는 `senderId`, `VisitLeave`는 `senderId === hostId`만 수용 | DOM-08a |
| G6 | 1.x에서 `WorldSystem` identity 계약 유지, JSDoc에 "위치 변경은 `updateObject` 경유" 명시. `EntityWorld` facade로 대체 후 2.0에서 제거 | DOM-02b |
| G8 | `persistPlayChanges` 기본값은 에디터 false, 런타임 true | COR-06b |
| G9 | `createGaesupRuntime()` 기본값은 모든 kit preset. engine만 원하면 `kits: []` | COR-09b |
| G10 | CJS는 2.0에서 제거 | PKG-02a |
| N1 | 렌더 단위는 공유 batch다. 엔진 콘텐츠(타일, 벽, NPC, 오브젝트)를 엔티티마다 React 컴포넌트로 그리지 않는다. 공개 React 컴포넌트는 엔티티를 만드는 선언형 adapter로 남긴다 | REN-01, 30 PRD |
| N2 | 물리 바디는 시스템이 Rapier API로 소유한다. Rapier 모듈은 주입받고 직접 의존성을 추가하지 않는다 | COR-07 |
| N3 | 1.x 공개 API는 adapter로 유지하고 제거는 2.0에서만 한다 | 전체 |
| N4 | 대량 콘텐츠(타일, 벽, 잔디, 인스턴스)는 엔티티를 하나씩 만들지 않고 그룹 엔티티 + 데이터 컴포넌트로 둔다. building은 16×16 셀 chunk 객체로 나눈다 | COR-02a, DOM-01b |
| N5 | 화질 목표는 고품질 스타일라이즈드다. 실사와 하드웨어 레이 트레이싱은 비목표다 | REN-14 |
| N6 | 1.x에서 `quality` 미지정은 기존 동작 유지, 예제·수용 장면은 `auto`, 2.0 기본값은 `auto` | REN-07 |
| N7 | 판정은 결정적 지표로 한다. ms는 기준 기기 로컬에서만 판정하고 CI에서는 경고만 한다 | 01 PRD |
| N8 | 수용 페이지는 PerformanceLab을 확장해 만든다. 새 페이지를 따로 만들지 않는다 | VER-04a |

기타 이어받은 결정: 카메라 충돌 기본값 유지(COR-07c 측정 전), SkinnedMesh 카메라 충돌은 bounds 근사, water·glass 기본값 유지(옵션만 추가), 한 페이지 여러 world 공식 지원, 저장하지 않는 엔티티는 `transient`, `src/blueprints`와 `ContentBundle`은 `@deprecated` 후 2.0 제거, pause 중 원격 플레이어 보간은 계속, edit 모드 물리 미리보기는 옵션(기본 off), AssetDB 기본 레코드는 샘플 에셋 패키지 매니페스트에.

## 5. 열린 질문(사용자 결정)

| 질문 | 관련 | 기본 제안 |
|---|---|---|
| `CascadedSun`을 공개해 쓸 것인가, 지울 것인가(지금 export·사용 0) | REN-08a | `/world` 기준 장면에 쓰고 공개 |
| 기준 기기(ms 판정) | VER-03b | 개발 PC(RTX 5060 Ti) 1종 + 내장 GPU 노트북 1종 |
| CI 트리거 브랜치를 `main`과 `master` 중 무엇으로 통일할 것인가 | VER-06a | 기본 브랜치 하나 |
| 샘플 GLB를 별도 패키지로 분리할 것인가, CDN으로 둘 것인가 | PKG-02c | 별도 패키지 |
| 루트의 `info.tsx`, `todolist.md`, `index.ts` 유지 여부 | PKG-04f | 확인 후 정리 |
| 네트워크 효과 없는 설정 필드를 제거할 것인가, 구현할 것인가 | DOM-08d | 1.x는 `@deprecated`, 2.0 제거 |

## 6. 운영 규칙

- 한 slice는 한 PR이다. PR 설명에 slice ID, 실행한 검증, 수용 시나리오 결과 표(`pnpm accept` 요약)를 적는다.
- known-red 시나리오가 green이 되면 같은 PR에서 known-red 목록에서 지운다.
- slice가 끝나면 해당 PRD에서 그 slice를 지운다. 항목의 모든 slice가 끝나면 항목을 지운다.
- 예산(`budgets.json`) 증가는 사용자 확인 후에만 한다.
