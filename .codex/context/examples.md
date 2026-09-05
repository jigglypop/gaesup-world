# Examples Architecture

## 책임

examples는 공개 라이브러리 소비자, 통합 환경, 제품 showcase, 미래 UX 프로토타입을 동시에 담당한다.

## 제품 라우트

- `/`: 제품 소개와 명확한 진입점
- `/world`: 일관된 플레이 가능한 월드
- `/creator`: 월드 제작 진입점
- `/multiplayer`: 멀티플레이어 검증
- `/assets`: Blender·GLB 카탈로그 검증
- `/performance`: 측정 기반 CPU/WebGPU 성능 시나리오

## 개발자 라우트

최소 통합, editor 전용 페이지, blueprint 진단, admin 테스트, 실험적 next-core 뷰는 Developer 카탈로그 아래에서 접근 가능하게 유지한다. 기존 URL은 호환 alias로 남길 수 있다.

## UX 규칙

- 월드가 시각적으로 우선이고 debug UI는 opt-in이다.
- 내비게이션은 평평한 컴포넌트 갤러리가 아니라 시나리오를 노출한다.
- 공유 shell이 최상위 내비게이션, 라우트 로딩, 개발자 접근을 소유한다.
- 라이브러리 import는 공개 패키지 entry만 사용한다.
- 기존 기능은 retain, integrate, Developer 이동으로 분류하고, 미사용·중복일 때만 remove한다.
