# Epoch 0 Baseline

## 기록된 상태

- examples shell slice 이전에 라이브러리 타입체크 통과.
- examples shell slice 이전에 examples 타입체크 통과.
- public API 테스트 통과: 8개.
- package export 테스트 통과: 9개.
- 전체 Jest 기준선 통과: 181 suite 통과, 1 skip; 1679 테스트 통과, 1 skip.
- 기존 examples는 이미 world, minimal, editor, NPC editor, showcase, building, blueprints, network, next, admin 라우트를 노출한다.
- examples에서 private `src`, `@/`, `@core/` import는 발견되지 않았다.

## UX 기준선

기본 `/` 라우트는 즉시 전체 월드를 연다. 내비게이션은 평평한 가로 스크롤 목록이다. 제품 시나리오, 개발자 진단, 실험이 섞여 있다. catalog과 error boundary는 있으나 제품 Home이나 시나리오 우선 shell을 제공하지 않는다.

## Renderer 의존성 기준선

- `useThree`: production 파일 11개
- 직접 `state.gl`: production 파일 2개
- `ShaderMaterial`: production 파일 8개
- `EffectComposer`: production 파일 3개
- `WebGLRenderer`: compatibility 유틸리티 1개
- 직접 renderer 메서드 패턴: production/example 파일 6개

## 기준선 주의사항

worktree에 광범위한 기존 사용자 변경과 생성된 demo 출력 변경이 있다. migration은 이를 reset하거나 restore하지 않아야 한다. 브라우저 스크린샷, GPU frame time, bundle 측정은 shell slice 구현과 demo/package 검증 완료 이후로 미룬다.
