# Research Topics

gaesup-world에서 바로 이어서 연구/실험할 수 있는 CE 주제 정리.

---

## 주제 목록

### 1. GPU-Driven Rendering
- 문서: `docs/research/GPU_DRIVEN_RENDERING.md`
- 핵심: CPU draw submission을 줄이고, compute culling / indirect draw / cluster assignment를 GPU 중심으로 이동

### 2. GPU Procedural Content Generation
- 문서: `docs/research/GPU_PROCEDURAL_GENERATION.md`
- 핵심: 지형, 잔디, 눈, 바람, 물결, 군중 분포를 GPU compute 또는 WASM hybrid로 생성

### 3. Visibility System
- 문서: `docs/research/VISIBILITY_SYSTEM.md`
- 핵심: frustum culling을 넘어 Hi-Z, portal, occluder extraction, tile-group cache까지 확장

### 4. GPU State Management
- 문서: `docs/research/GPU_STATE_MANAGEMENT.md`
- 핵심: Zustand authoring state와 별개로 SoA / typed array / storage buffer 기반 GPU 친화 상태 계층 설계

---

## 권장 읽기 순서

1. `GPU_STATE_MANAGEMENT.md`
2. `GPU_DRIVEN_RENDERING.md`
3. `VISIBILITY_SYSTEM.md`
4. `GPU_PROCEDURAL_GENERATION.md`

이 순서가 좋은 이유:

- 상태 구조를 먼저 정리해야 렌더/가시성/생성 파이프라인을 안정적으로 붙일 수 있다.
- visibility는 GPU-driven 렌더링과 직접 연결된다.
- procedural generation은 앞선 구조가 정리될수록 CPU/GPU sync 비용을 줄이기 쉽다.

---

## 공통 실험 축

모든 주제는 아래 공통 축으로 비교 평가한다.

- CPU frame time
- GPU frame time
- draw call 수
- culling cost
- upload bandwidth
- chunk load latency
- edit 반영 지연 시간
- 메모리 사용량
- WebGPU / WebGL fallback 차이

---

## 적용 우선순위

### P1
- GPU 친화 상태관리
- GPU-driven grass / prop culling

### P2
- Hi-Z 기반 visibility
- tile-group visibility cache

### P3
- GPU procedural grass / wind / snow generation
- indoor / outdoor hybrid portal visibility
