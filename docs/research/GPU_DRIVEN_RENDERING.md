# GPU-Driven Rendering

gaesup-world를 CPU 제출 중심 렌더링에서 GPU 주도 렌더링으로 확장하기 위한 연구 주제 정리.

---

## 1. 문제 정의

현재 대규모 반복 오브젝트 씬에서 CPU는 아래 일을 많이 담당한다.

- 어떤 인스턴스를 그릴지 선택
- 거리 기반 LOD 계산
- visible list 생성
- draw submission 순서 정리
- instance count 갱신
- material / mesh 단위 묶기

오브젝트 수가 커질수록 병목이 GPU보다 CPU 쪽에서 먼저 온다. 특히 아래 대상에서 부담이 커진다.

- grass
- sakura / snow / billboard 같은 반복 장식
- building part
- NPC accessory / prop

---

## 2. 연구 목표

- frustum culling을 GPU compute로 이전
- visible instance list를 GPU buffer에서 직접 생성
- indirect draw 기반으로 CPU draw submission 최소화
- mesh / material / tile cluster 단위로 GPU-side grouping 수행
- 향후 visibility / procedural generation과 바로 연결 가능한 파이프라인 설계

---

## 3. 핵심 기법

### 3.1 Compute Culling

입력:

- instance transform
- bounds
- mesh id
- material id
- lod metadata

출력:

- visible instance index buffer
- draw args buffer

처리:

- frustum test
- distance band test
- optional screen coverage test

### 3.2 Indirect Draw

CPU가 인스턴스마다 draw 호출하지 않고, GPU가 만든 draw argument buffer를 사용해 draw를 실행한다.

효과:

- CPU submission 감소
- 대량 반복 오브젝트에 유리
- visibility와 draw 연결 비용 감소

### 3.3 Cluster Assignment

인스턴스를 아래 기준으로 cluster화한다.

- mesh
- material
- tile group
- lod band

cluster 단위로 정리하면 indirect draw 수와 state change 수를 동시에 줄일 수 있다.

### 3.4 GPU-side LOD Selection

LOD 판단을 CPU가 아니라 GPU compute에서 수행한다.

예:

- 가까움: full geometry
- 중간: reduced density
- 멀리: shadow off / coarse proxy

---

## 4. gaesup-world 적용 지점

### 즉시 대상

- `src/core/building/components/mesh/grass/`
- `src/core/building/components/mesh/sakura.tsx`
- `src/core/building/components/mesh/snowfield.tsx`
- 반복 배치되는 building part / prop

### 제안 모듈

- `src/core/rendering/gpu/`
  - `RenderStateBuffer.ts`
  - `InstanceCluster.ts`
  - `ComputeCullingPipeline.ts`
  - `IndirectDrawPipeline.ts`
  - `GpuLod.ts`

---

## 5. 상태 흐름

1. CPU authoring state에서 instance metadata 추출
2. SoA 기반 render state buffer로 미러링
3. GPU storage buffer 업로드
4. compute pass에서 visible list / draw args 생성
5. render pass에서 indirect draw 실행

이 구조에서는 CPU가 "무엇을 그릴지"보다 "무슨 데이터가 바뀌었는지"만 관리하는 쪽으로 역할이 줄어든다.

---

## 6. 실험 질문

- CPU-driven instancing 대비 GPU-driven culling은 어느 인스턴스 수부터 유리한가
- grass처럼 밀도가 높은 인스턴스와 building part처럼 무거운 인스턴스 중 어디서 이득이 더 큰가
- WebGPU compute + indirect draw가 WebGL CPU culling 대비 얼마나 개선되는가
- cluster granularity가 너무 작거나 클 때 각각 어떤 비용이 생기는가

---

## 7. 평가 지표

- CPU frame time
- GPU frame time
- draw call 수
- visible instance 생성 비용
- indirect draw 준비 비용
- upload bandwidth
- 총 인스턴스 수 대비 실제 렌더 인스턴스 수

---

## 8. 단계별 구현 계획

### Stage 1
- render state buffer 도입
- CPU culling 유지
- GPU-friendly data layout만 먼저 확립

### Stage 2
- grass / props 대상으로 compute frustum culling 도입
- visible index buffer 생성

### Stage 3
- indirect draw 연결
- cluster assignment 도입

### Stage 4
- GPU-side LOD와 visibility pipeline 통합

---

## 9. 예상 리스크

- WebGPU 지원 범위 차이
- indirect draw API 제약
- 작은 씬에서는 오히려 compute dispatch 비용이 손해일 수 있음
- 상태 동기화가 정리되지 않으면 GPU-driven 구조가 오히려 복잡도만 증가

---

## 10. 권장 선행 조건

- `docs/research/GPU_STATE_MANAGEMENT.md`
- `docs/research/VISIBILITY_SYSTEM.md`

GPU-driven 렌더링은 상태 구조와 visibility 체계가 먼저 정리될수록 성공 가능성이 높다.
