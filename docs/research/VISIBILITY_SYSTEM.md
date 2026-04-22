# Visibility System

gaesup-world의 현재 culling을 넘어, 실내외 혼합 월드에 적합한 고급 visibility 시스템을 연구하기 위한 문서.

---

## 1. 문제 정의

기본 frustum culling만으로는 충분하지 않다.

- 큰 건물 뒤에 완전히 가려진 잔디 / 소품도 여전히 처리될 수 있음
- indoor / outdoor가 섞인 월드에서 보이지 않는 room까지 렌더 후보가 될 수 있음
- 반복 타일 월드에서는 tile group 단위 캐시가 없으면 매 프레임 같은 visibility 계산을 반복함

즉, "카메라 안에 있음"과 "실제로 보임"은 다르다.

---

## 2. 연구 목표

- frustum culling 위에 occlusion-aware visibility를 추가
- indoor / outdoor 혼합 환경에서 portal 기반 가시성 도입
- tile-group 단위 visibility cache로 반복 계산 절감
- GPU-driven rendering과 직접 연결 가능한 visibility 결과 생성

---

## 3. 핵심 기법

### 3.1 Hierarchical Z (Hi-Z) Occlusion

depth pyramid를 만들고, 큰 bounding volume이 실제로 depth 뒤에 완전히 가려졌는지 빠르게 판정한다.

장점:

- 대형 건물 / 절벽 뒤 오브젝트 제거 가능
- GPU compute와 잘 결합됨

적합 대상:

- grass tile
- prop cluster
- building part group
- NPC group

### 3.2 Portal / Room Culling

실내외 혼합 구조에서는 room graph와 portal 정보를 유지하면 훨씬 정확한 visibility를 얻을 수 있다.

예:

- house interior
- doorway
- window
- corridor

카메라가 있는 room에서 시작해 portal로 연결된 room만 확장 탐색한다.

### 3.3 Occluder Extraction

씬 전체를 occluder로 쓰면 비싸므로, 큰 벽 / 집 / 절벽처럼 실제로 가림 효과가 큰 geometry만 추려야 한다.

후보:

- building walls
- roof mass
- terrain ridge
- large static prop

### 3.4 Tile-group Visibility Cache

카메라가 특정 cell에 있을 때 어떤 tile group이 대체로 보이는지 캐싱한다.

장점:

- 반정적 월드에서 매우 저렴
- 편집 월드에도 적용 가능
- 매 프레임 전량 재계산을 줄일 수 있음

---

## 4. gaesup-world 적용 지점

### 기존 구조와 연결

- `src/core/scene/`
- `src/core/building/`
- `src/core/rendering/`
- `examples/pages/World.tsx`

### 제안 모듈

- `src/core/rendering/visibility/`
  - `VisibilityManager.ts`
  - `FrustumStage.ts`
  - `HiZOcclusionStage.ts`
  - `PortalGraph.ts`
  - `OccluderRegistry.ts`
  - `TileVisibilityCache.ts`

---

## 5. 하이브리드 전략

이 프로젝트에 가장 맞는 구조는 단일 방식이 아니라 하이브리드다.

### Outdoor
- frustum culling
- Hi-Z occlusion
- tile-group visibility cache

### Indoor
- room / portal graph
- room-local occluder

### Mixed
- outdoor scene root
- indoor scene root
- portal transition 시 visibility context 전환

---

## 6. 실험 질문

- Hi-Z occlusion은 어떤 density / occluder 규모에서 실질적 이득이 나는가
- portal culling만으로 충분한 실내 씬 규모는 어느 정도인가
- tile-group cache가 동적 편집이 섞인 월드에서도 충분히 유지 가능한가
- outdoor Hi-Z + indoor portal의 하이브리드가 단일 방식보다 얼마나 효율적인가

---

## 7. 평가 지표

- visible object 수
- draw call 감소량
- occlusion test cost
- portal traversal cost
- false positive / false negative 비율
- room transition 시 visibility 재계산 비용
- edit 후 cache invalidation 비용

---

## 8. 단계별 구현 계획

### Stage 1
- 현재 frustum culling 단계 정리
- tile / object bounds 표준화

### Stage 2
- tile-group visibility cache 도입
- grass / prop부터 적용

### Stage 3
- indoor room / portal graph 구축
- scene 전환 구조와 연결

### Stage 4
- Hi-Z occlusion 도입
- GPU-driven rendering과 visible result 연결

---

## 9. 예상 리스크

- dynamic edit가 많으면 occluder / cache invalidation 비용이 커질 수 있음
- 작은 씬에서는 Hi-Z 오버헤드가 손해일 수 있음
- portal graph 유지 비용과 실제 이득의 균형이 중요함

---

## 10. 관련 문서

- `docs/research/GPU_DRIVEN_RENDERING.md`
- `docs/research/GPU_STATE_MANAGEMENT.md`

visibility는 독립 기능이 아니라 렌더링 제출량을 줄이는 핵심 단계다. 따라서 GPU-driven rendering과 한 묶음으로 연구하는 것이 가장 효과적이다.
