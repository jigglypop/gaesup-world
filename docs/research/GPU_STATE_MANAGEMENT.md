# GPU State Management

gaesup-world에서 GPU-driven rendering과 GPU procedural generation을 실제로 가능하게 만드는 상태관리 구조 연구 문서.

---

## 1. 문제 정의

일반적인 앱 상태와 GPU 친화 상태는 요구사항이 다르다.

현재 authoring / domain state는 아래 특성이 강하다.

- object tree
- nested store
- string key
- domain 중심 모델
- save / undo / UI 친화

반면 GPU는 아래 구조를 선호한다.

- 연속 메모리
- typed array
- fixed stride
- index 기반 접근
- append / compact friendly layout
- storage buffer 직접 업로드 가능 구조

즉, 하나의 상태 구조로 모든 계층을 해결하려고 하면 비효율이 발생한다.

---

## 2. 연구 목표

- authoring state와 render state를 분리
- domain logic 친화 상태와 GPU 친화 상태를 명확히 나눈다
- dirty-range 기반 증분 업로드를 지원한다
- chunk residency, visibility, procedural generation과 같은 GPU 파이프라인이 직접 읽을 수 있는 구조를 만든다

---

## 3. 권장 3계층 구조

### 3.1 Authoring State

역할:

- 유저 편집
- UI 반응
- undo / redo
- save / load
- 도메인 규칙 처리

예:

- building store
- scene state
- weather state
- quest / inventory state

기술:

- Zustand
- domain object model

### 3.2 Simulation State

역할:

- CPU / WASM batch update
- 숫자 기반 entity 관리
- 시스템 단위 반복 처리

예:

- transform
- velocity
- ai flags
- collider proxy
- chunk membership

기술:

- SoA
- entity id
- typed array
- sparse set

### 3.3 GPU State

역할:

- storage buffer 업로드
- compute culling
- indirect draw
- GPU procedural generation 입력 / 출력

예:

- positions
- rotations
- scales
- bounds
- material ids
- mesh ids
- visibility flags
- lod metadata
- chunk ranges

---

## 4. 핵심 설계 요소

### 4.1 SoA Layout

권장 예시:

- `positionX[]`
- `positionY[]`
- `positionZ[]`
- `rotationQuat[]`
- `scale[]`
- `bounds[]`
- `meshId[]`
- `materialId[]`
- `flags[]`
- `chunkId[]`

장점:

- 연속 메모리
- SIMD / WASM 친화
- GPU 업로드 단순화
- 부분 갱신 범위 계산 용이

### 4.2 Dirty Range / Delta Upload

매 프레임 전체 버퍼를 업로드하지 않는다.

필요 기능:

- dirty entity list
- dirty chunk list
- dirty range merge
- partial `writeBuffer`

연구 포인트:

- full upload 대비 partial upload의 이득
- dirty range가 잘게 쪼개질 때의 최적 병합 전략

### 4.3 Chunk Residency

큰 월드에서는 chunk 단위 관리가 필수다.

필요 메타데이터:

- chunk active 여부
- instance range 시작 / 길이
- resident GPU buffer offset
- visibility bit
- generation version

### 4.4 Double Buffer / Snapshot

렌더링 중간에 상태가 바뀌면 일관성이 깨진다.

권장:

- front snapshot: GPU 읽기용
- back snapshot: CPU 쓰기용
- frame end swap

### 4.5 Event-driven GPU Sync

상태 전체를 매번 다시 만드는 대신 이벤트를 누적한다.

예:

- tile added
- tile removed
- chunk regenerated
- bounds changed
- material changed
- weather updated

이벤트 기반 접근은 편집 월드에 특히 유리하다.

---

## 5. gaesup-world 적용 지점

### 기존 연결 대상

- `src/core/building/stores/buildingStore.ts`
- `src/core/perf/stores/perfStore.ts`
- `src/core/scene/`
- `src/core/rendering/`

### 제안 모듈

- `src/core/state/gpu/`
  - `RenderStateMirror.ts`
  - `GpuBufferArena.ts`
  - `DirtyRangeTracker.ts`
  - `ChunkResidencyTable.ts`
  - `FrameSnapshot.ts`
  - `GpuEventQueue.ts`

---

## 6. 실험 질문

- Zustand authoring state를 직접 GPU에 반영하는 구조와 중간 SoA mirror를 두는 구조 중 어느 쪽이 더 효율적인가
- dirty-range upload가 instance count와 edit frequency에 따라 어느 정도까지 유효한가
- chunk-resident layout이 단일 monolithic buffer보다 streaming과 visibility에 더 유리한가
- double-buffer snapshot이 sync stall과 tearing을 얼마나 줄이는가

---

## 7. 평가 지표

- CPU upload cost
- GPU buffer write volume
- sync stall time
- edit 반영 지연 시간
- chunk load / unload latency
- memory overhead
- 상태 복제 비용
- visibility / rendering 파이프라인 연결 비용

---

## 8. 단계별 구현 계획

### Stage 1
- building / grass / prop에 대한 render-state mirror 도입
- authoring state와 GPU state 분리

### Stage 2
- dirty-range tracker 추가
- partial buffer upload 적용

### Stage 3
- chunk residency table 도입
- streaming / visibility와 결합

### Stage 4
- GPU event queue와 frame snapshot 구조 도입
- GPU-driven rendering / procedural generation과 연결

---

## 9. 예상 리스크

- 상태가 한 번 더 복제되므로 메모리 사용량 증가
- 계층이 늘어나며 디버깅 난이도 상승
- 작은 프로젝트 규모에서는 구조 복잡도 대비 이득이 작을 수 있음

---

## 10. 관련 문서

- `docs/research/GPU_DRIVEN_RENDERING.md`
- `docs/research/GPU_PROCEDURAL_GENERATION.md`
- `docs/research/VISIBILITY_SYSTEM.md`

GPU-driven 구조를 제대로 연구하려면 가장 먼저 상태 구조를 재정의해야 한다. 이 문서는 그 기반이 되는 문서다.
