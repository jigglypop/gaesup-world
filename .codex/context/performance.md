# Performance

## Regression 신호

가능한 범위에서 CPU frame time, GPU frame time, FPS, draw call, triangle, material 수, texture·geometry 메모리 추정치, rigid body·collider 수, JS heap, 반복 할당, entity 수, network byte·message 수, bundle 크기, asset 크기를 추적한다.

## 시나리오 등급

- SMALL: 집 하나, 아바타 하나, 수십 개 객체.
- MEDIUM: 동네 규모, 복수 아바타, 수백에서 수천 개의 가시 entity.
- STRESS: 예상 production 밀도를 의도적으로 초과.

## Guardrails

- simulation 데이터를 위해 매 frame React setState를 하지 않는다.
- 매 frame 불필요한 Zustand write를 하지 않는다.
- 반복 할당을 최소화하고 scratch 객체를 재사용한다.
- world 객체당 subscription 하나, 독립 useFrame 하나를 만들지 않는다.
- 반복 prop당 material 하나, draw call 하나를 만들지 않는다.
- material, geometry, texture, GPU resource는 명시적 ownership으로 dispose한다.
- shadow caster를 제한하고 큰 환경 asset에는 LOD를 정의한다.
- 성능 수치는 마케팅 주장이 아니라 regression 기준선이다.
