# GPU Procedural Content Generation

gaesup-world에서 절차적 생성 비용을 CPU에서 GPU compute 또는 WASM hybrid로 옮기기 위한 연구 문서.

---

## 1. 문제 정의

현재 procedural 요소는 주로 CPU 또는 WASM에서 생성/갱신된다. 이 방식은 구현이 단순하지만, 대규모 청크 월드에서는 아래 문제가 생긴다.

- 청크 생성 순간 CPU spike
- 대량 잔디 / 눈 / 소품 분포 생성 비용 증가
- 생성 후 다시 GPU로 업로드해야 하는 이중 비용
- edit 시 즉시 재생성이 필요할 때 응답성 저하

---

## 2. 연구 목표

- 절차적 생성 파이프라인을 GPU compute 중심으로 재구성
- CPU는 생성 규칙과 seed만 전달하고, 실제 대량 샘플 생성은 GPU에서 수행
- chunk 경계 연속성과 deterministic seed를 유지
- CPU readback 없이 생성 결과를 바로 culling / rendering으로 연결

---

## 3. 적용 대상

### 3.1 Terrain
- height field
- surface mask
- biome weight

### 3.2 Foliage
- grass blade offset
- density field
- variation mask

### 3.3 Weather / Effects
- snow spawn distribution
- wind field
- water auxiliary ripple field

### 3.4 Population / Decor
- crowd density map
- decor placement candidate
- ambient prop distribution

---

## 4. 핵심 연구 포인트

### 4.1 생성 비용

비교 대상:

- CPU JS
- CPU WASM
- GPU compute
- CPU seed + GPU expansion hybrid

비교 항목:

- 청크 1개 생성 시간
- 다중 청크 동시 생성 시간
- edit 후 부분 재생성 시간

### 4.2 Seed 일관성

GPU 기반 생성에서도 아래가 보장되어야 한다.

- 동일 seed면 동일 결과
- chunk load 순서가 달라도 동일 결과
- CPU fallback과 의미적으로 일치

권장 입력:

- `globalSeed`
- `chunkCoord`
- `worldSpaceCoord`
- `localIndex`

### 4.3 Chunk 경계 연속성

절차적 생성에서 가장 중요한 품질 문제 중 하나다.

- 높이맵 seam
- grass density seam
- wind field discontinuity
- water ripple mismatch

이를 피하려면 chunk local 좌표보다 world-space 기반 함수를 우선해야 한다.

### 4.4 CPU / GPU Sync 최소화

핵심 원칙:

- GPU에서 생성한 결과를 가능한 한 CPU로 다시 읽지 않는다
- 생성된 데이터를 바로 culling / draw에 재사용한다

즉, 이상적인 흐름은 다음과 같다.

1. CPU가 seed / rule 변경만 기록
2. GPU가 instance distribution 생성
3. GPU가 visibility 판정
4. GPU가 draw 실행

---

## 5. gaesup-world 적용 지점

### 기존 연결 가능 지점

- `src/core/building/components/mesh/grass/`
- `src/core/building/components/mesh/snow/`
- `src/core/building/components/mesh/water/`
- `src/core/rendering/`
- `src/core/weather/`

### 제안 모듈

- `src/core/rendering/procedural/`
  - `ChunkSeed.ts`
  - `GpuNoisePipeline.ts`
  - `GpuGrassDistribution.ts`
  - `GpuWindField.ts`
  - `ChunkGenerationOrchestrator.ts`

---

## 6. 실험 질문

- grass / snow distribution 생성은 CPU WASM보다 GPU compute가 항상 유리한가
- chunk 크기에 따라 최적 생성 위치가 달라지는가
- GPU 생성 결과를 CPU readback 없이 연결할 때 전체 파이프라인 비용은 얼마나 줄어드는가
- world-space seed 설계가 chunk seam 문제를 얼마나 줄이는가

---

## 7. 평가 지표

- chunk generation latency
- multi-chunk throughput
- edit 반영 지연 시간
- CPU usage
- GPU compute cost
- buffer upload volume
- chunk seam artifact 빈도
- deterministic reproducibility

---

## 8. 단계별 구현 계획

### Stage 1
- deterministic seed / chunk coordinate 규칙 정립
- CPU / WASM / GPU 결과 비교용 baseline 생성

### Stage 2
- grass distribution GPU compute화
- CPU readback 없이 렌더 파이프라인 연결

### Stage 3
- snow / wind field 확장
- chunk partial regeneration 추가

### Stage 4
- terrain / decor / crowd density까지 확장

---

## 9. 예상 리스크

- GPU 생성 결과 디버깅 난이도 증가
- 브라우저별 WebGPU compute 성능 차이
- 너무 작은 작업 단위에서는 dispatch overhead가 손해일 수 있음
- CPU fallback과 결과를 완전히 동일하게 맞추기 어려움

---

## 10. 관련 문서

- `docs/research/GPU_DRIVEN_RENDERING.md`
- `docs/research/GPU_STATE_MANAGEMENT.md`

GPU procedural generation은 단독 주제이기도 하지만, 결국 GPU-driven rendering과 같은 파이프라인으로 묶였을 때 가장 큰 효과를 낸다.
