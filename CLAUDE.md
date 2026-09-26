# gaesup-world agent harness

이 저장소는 React, React Three Fiber, Three.js, Rapier, Zustand를 지원하는 TypeScript 3D world library와 Vite 기반 `examples/` showcase를 함께 관리한다. 안정적인 공개 패키지 API, data-oriented runtime, WebGPU-first rendering, persistent world model, multiplayer와 asset pipeline을 함께 발전시키는 것이 목표다.

# 예제 
- minihome은 gaesup-world의 작동을 보여주기 위한 예시코드이다
- gaesup-world의 기능을 보여주기 위한 목적으로 구현한다
- 별도의 라이브러리로 하드코딩하거나 구현하지 않는다

# 참고
- 예시로 주는 것들을 그대로 구현하지 않고 참고만 한다
- 간결한 코드와 읽기 쉬운 코드를 지향한다
- 채팅에 최대한 현재 진행상황에 대해 한글로 된 설명을 하면서 진행한다
- 작업 시작 전 ./prd 에 작업을 정리하고, 종료 시 삭제한다
- 임시로 만든 파일이나 찌꺼기는 최대한 삭제한다
- 새로운 md 파일의 무한 생성은 되도록 지양한다

## 금지
- 쓸데없는 문구는 금한다
- 속도, 안정성, 코드 간결성을 우선한다
- dry, kiss, 모듈화에 신경쓴다
- 단발성 스크립트는 쓰고 바로 폐기한다
- 기능이 망가지면 안되며, 되도록 빠르고 간결한 코어를 지향한다
- webGPU 등 속도 관점을 최우선 신경쓴다
- 언리얼 엔진 웹버전을 지향하며 기능을 추가해 나간다