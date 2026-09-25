# PRD-50 에디터

| 항목 | 값 |
|---|---|
| 우선순위 | P1 |
| 마일스톤 | M3(EDT-03·EDT-05·EDT-06), M5(나머지) |
| 선행 | 10 PRD COR-02(컴포넌트 레지스트리)·COR-06(`runtime.mode`), 40 PRD AST-07(undo) |

## 1. 목표

유니티 에디터와 같은 흐름을 만든다.

- 씬의 모든 엔티티가 Hierarchy 하나에 나온다. 플레이어, NPC, 건설, 원격 플레이어(transient)가 여기에 포함된다.
- Inspector는 컴포넌트 정의에서 필드 편집기를 만든다.
- Play/Pause/Stop이 저작 데이터를 건드리지 않는다.
- undo는 그 명령만 되돌린다.

에디터 UI가 월드 프레임 비용에 영향을 주지 않게 한다. 패널은 필요한 값만 구독하고, 보조 캔버스는 필요할 때만 그린다.

## 2. 현재 상태

| 문제 | 근거 |
|---|---|
| 에디터가 둘로 갈라짐: `BuildingPanel`(building·npc store 편집)과 Hierarchy/Inspector(`SceneDocument` 편집). 예제는 `sceneDocument` prop을 넘기지 않는다 | `editor/components/panels/HierarchyPanel.tsx:43`, `InspectorPanel.tsx:58` |
| Inspector가 컴포넌트 타입을 자유 텍스트로 추가하고 데이터를 `<pre>{JSON.stringify(...)}</pre>`로 표시 | `InspectorPanel.tsx:285` |
| 모드 출처 4곳, `createEditorPlayModeController` 호출 0 | `editor/playMode.ts:37`, `editorSlice.ts:19` |
| NPC 패널이 `instances` Map 전체 구독 → NPC 결정 틱마다 memo 없는 `NPCBrainSection`(2,142줄), ReactFlow, 미리보기 Canvas 재렌더 | `BuildingPanel/NPCPanel.tsx:26-33`, `brain/index.tsx:68`, `BuildingPanel/flow.tsx:161-172` |
| `BuildingPanel` 마운트마다 `initializeDefaults`가 템플릿·의상을 새 객체로 바꿈(패널 전환마다 모든 NPC 재렌더) | `BuildingPanel/index.tsx:126-129`, `npc/stores/npcStore.ts:319-355,373` |
| 에셋 재질 섹션이 그룹 이름 표시를 위해 `tileGroups`·`wallGroups` 전체 구독 | `BuildingPanel/index.tsx:270` |
| 건설 hover가 mousemove마다 `getBoundingClientRect`와 블록 전체 선형 탐색 | `building/hooks/useBuildingEditor.ts:116` |
| `BuildingUI`가 store 필드 108개를 한 번에 구독(1,555줄), 에디터 섹션과 중복 | `building/components/BuildingUI/index.tsx:156-260` |
| `BlueprintPreview`가 실행 중인 월드의 store·runtime을 직접 바꿈: 선택마다 메인 플레이어 모델 교체, 메인 월드 속도·카메라 변경, 고정 시계 하나가 물리 월드 둘을 스텝 | `blueprints/components/BlueprintPreview/index.tsx:60,76-138` |
| `BlueprintPreview` 두 번째 Canvas가 frameloop·dpr 미지정으로 섀도맵·환경맵·무한 그리드를 매 프레임 렌더, 휠 1틱마다 store 쓰기 5회, 선택마다 key 재마운트로 컨텍스트·Rapier 월드 재생성 | `BlueprintPreview/index.tsx:140-240`, `BlueprintEditor/index.tsx:386` |
| `CameraDebugger.update`가 호출마다 geometry·재질·Line을 만들고 dispose 클로저를 누적, `CameraDebugPanel`이 정지 상태에서도 100ms마다 재렌더 | `camera/debug/CameraDebugger.ts:131`, `camera/components/CameraDebugPanel/index.tsx:97` |
| 에셋 미리보기가 보이는 타일마다 WebGL 컨텍스트 생성, autoRotate로 계속 렌더 | `assets/components/AssetPreviewCanvas/index.tsx:110-115` |

## 3. 작업

### EDT-01 Hierarchy/Inspector 통합(M5)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| EDT-01a | Hierarchy가 `EntityWorld`의 엔티티 목록을 보여준다(영속 + transient 구분 표시). 에디터가 runtime의 문서 controller를 기본으로 쓴다 | 플레이어·NPC·건설 그룹·원격 플레이어가 한 목록에 표시 |
| EDT-01b | Inspector가 `defineComponent` 정의에서 필드 편집기를 만든다(스키마 kind는 `ScriptPropSchema` 재사용). 추가 가능한 컴포넌트는 레지스트리 목록에서 고른다 | 표준 컴포넌트 9종의 필드 편집, JSON 표시 제거 |
| EDT-01c | `BuildingPanel`의 건설·NPC 편집을 Inspector의 컴포넌트 편집기로 흡수(패널은 도구 모음으로 축소). `BuildingUI`는 editor 섹션을 조합하는 wrapper로 줄이고 `@deprecated` | `BuildingUI` 500줄 이하, 중복 필드 목록 0 |

### EDT-02 Play 제어(M5)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| EDT-02a | 툴바 Play/Pause/Stop이 `runtime.mode`(COR-06)를 조작. `editorSlice.playMode`, `createEditorPlayModeController`는 이 값을 읽는 adapter | S-H05, 손 확인: Play → 조작 → Stop 후 씬 동일 |

### EDT-03 패널 구독(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| EDT-03a | NPC 패널은 id 목록과 이름만, 선택 NPC는 개별 selector(휘발 필드 제외 비교)로 구독. `NPCBrainSection`·NPC 섹션·미리보기 memo, ReactFlow 옵션 모듈 상수 | S-B13: NPC 패널을 연 채 결정 틱 10초 동안 패널 commit 0 |
| EDT-03b | `BuildingPanel` 마운트 시 `initializeDefaults` 호출 제거(초기화는 runtime 생성 또는 hydrate migration에서 1회) | 패널 전환 10회 동안 NPC 재렌더 0 |
| EDT-03c | 에셋 재질 섹션은 그룹 이름 목록만 구독. hover는 캔버스 rect를 리사이즈 때만 읽고 `BuildingSpatialIndex`로 조회 | hover sweep 5초 동안 패널 commit 0 |

### EDT-04 대형 패널 분할(M5)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| EDT-04a | `BuildingPanel/brain/index.tsx`(2,142줄)를 graph editor, node inspector, condition/action editor, preview-state hook, validation util로 분할. `GameplayEventPanel`(useState 9개)도 같은 방식 | 파일 500줄 이하, 에디터 수용 시나리오(VER-08a로 옮긴 에디터 확인) 통과 |

### EDT-05 보조 캔버스(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| EDT-05a | `BlueprintPreview` 격리: 전용 store와 전용 preview runtime(또는 runtime 없음) Provider. 복원 로직 삭제 | S-B13: 미리보기 열고 선택 10회 동안 메인 월드 store 변경 0 |
| EDT-05b | 미리보기 Canvas `frameloop="demand"`, `dpr={1}`, 섀도 끄거나 캐릭터 주변 ±4m·512², 환경은 로컬(외부 HDR 0), 휠은 ref로 처리하고 줌 경로 하나, 선택 시 재마운트 대신 모델 교체 | 입력 없을 때 미리보기 렌더 0, 휠 이벤트당 store 쓰기 ≤ 1 |
| EDT-05c | 에셋 미리보기는 공유 오프스크린 renderer로 썸네일을 한 번 렌더해 이미지로 캐시하거나 단일 Canvas + drei `<View>` | 에셋 패널 스크롤 중 `webglcontextlost` 0 |

### EDT-06 디버그 도구(M3)

| Slice | 내용 | 완료 기준 |
|---|---|---|
| EDT-06a | `CameraDebugger`는 geometry·재질·Line을 한 번 만들고 버퍼만 갱신, dispose 1회. `CameraDebugPanel` 변경 검사에서 frameCount·시각 제외 | 10분 실행 후 geometry 수 불변, 정지 시 패널 commit 0 |

### EDT-07 라이팅 베이크 UI(M6)

20 PRD REN-14a(라이트 프로브·라이트맵 베이크)의 에디터 쪽이다. 베이크 실행, 진행률, 결과 미리보기, 베이크 데이터를 AssetDB 에셋으로 저장하는 흐름을 둔다.

| Slice | 내용 | 완료 기준 |
|---|---|---|
| EDT-07a | Lighting 창: 베이크 실행·취소, 진행률, 결과 에셋 저장, 적용 토글 | 베이크 → 저장 → 새로고침 후 적용 유지 |

## 4. 공개 API 영향

- 추가만: Inspector 필드 편집기, 에디터의 runtime controller 기본 사용.
- `BuildingUI`, `editorSlice.playMode`, `createEditorPlayModeController`는 유지하되 adapter로 바꾼다. `BuildingUI`는 2.0에서 제거한다.
- `NPCPanel` 이름 중복 해소는 2.0에서 한다.

## 5. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| `BuildingPanel` 흡수 중 편집 기능 누락 | 에디터 기능 체크리스트를 수용 시나리오로 먼저 만든다. 기존 에디터 probe(`probe-creator-menu`, `probe-editor-return`)는 삭제된 라우트를 열어 지금 동작하지 않으므로 VER-08a에서 옮긴다. 흡수 전후 같은 조작 결과를 비교 |
| 미리보기 격리로 spawn 경로(`runtime.worldBridge` 요구)가 깨짐 | spawn은 메인 runtime에 명시적으로 요청하는 API로 분리 |
