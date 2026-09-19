# gaesup-world agent harness

이 저장소는 React 18/19, React Three Fiber 8/9, Three.js, Rapier, Zustand를 지원하는 TypeScript 3D world library와 Vite 기반 `examples/` showcase를 함께 관리한다. 안정적인 공개 패키지 API, data-oriented runtime, WebGPU-first rendering, persistent world model, multiplayer와 asset pipeline을 함께 발전시키는 것이 목표다.

## 모델과 역할
- 루트 에이전트는 항상 `gpt-6-astra`를 사용한다.
- 루트는 사용자 목표, 작업 범위, 현재 상태, 설계 판단, 구현 통합, 검증 범위, 완료 판정과 최종 응답을 끝까지 소유한다.
- 보조 에이전트는 `gpt-5.6-sol`을 사용한다. 기본 reasoning effort는 `medium`, 단순 탐색과 정형 검증은 `low`를 사용할 수 있다.
- Sol은 범위가 명확한 조사, 코드 탐색, 로그 분석, 테스트 실행, 독립 리뷰만 맡는다. 전체 설계, 최종 통합, 파괴적 작업, 외부 쓰기, 완료 판정은 맡기지 않는다.
- 성능 최적화가 목표

## 금지
- 쓸데없는 문구, 요청하지 않은 기능 제외는 금한다