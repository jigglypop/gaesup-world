# Epoch 2 Examples Shell

## 목표

world simulation, physics, building 내부, network protocol, save format을 보존하면서 시나리오 우선 examples shell을 도입한다.

## 완료한 것

- 제품 Home과 AppShell 추가.
- World, Creator, Multiplayer, Assets, Performance를 제품 시나리오로 승격.
- 레거시·개발자 라우트를 Developer 메뉴와 catalog 뒤에 보존.
- 공개 asset catalog 소비를 추가하고 examples를 패키지 entry로 유지.
- 라우트 분류, 유일성, 양방향 App 라우트 drift 테스트 추가.
- 기존 World performance overlay 계약을 유지하고 새 diagnostics flag는 diagnostics 컨트롤로 제한.
- transitive `postprocessing` runtime 요구사항을 optional peer + 직접 개발 의존성으로 선언해 독립 패키지 소비를 수정.

## 제외 범위

- R3F 10 의존성 업그레이드
- WebGPURenderer migration
- WorldDocument 구현
- movement, physics, building placement, network protocol, save format 변경

## 호환성

`/edit`, `/network`, `/next`, `/showcase`, `/building`, `/blueprints`, `/admin`, `/examples`는 라우팅을 유지한다. `/creator`, `/multiplayer`, `/assets`, `/performance`는 기존 구현을 재사용한다. runtime과 World 파일의 기존 사용자 변경은 보존하고 이 shell slice 밖으로 분류했다.

## Reviewer findings

- 스크롤을 product 그룹으로 옮기고 메뉴를 overflow-visible 내비게이션 shell 안에 배치해 Developer 드롭다운 clipping 리스크 수정.
- 양방향 manifest/App 계약 테스트로 라우트 source-of-truth drift 리스크 수정.
- 패키지 소비 계약이 regression을 잡은 뒤 기존 performance overlay 동작 복원.
- mutable character 기본값, character public API 커버리지, 무관한 runtime/input 변경은 이 slice 이전부터 존재했고 범위 밖이라 보류.
- 생성된 `dist/`, `demo-dist/`, `.tmp/` 변경은 명령이 만든 검증 산출물이지 수작업 편집 소스가 아니다.

## 검증 결과

- 라이브러리 TypeScript 빌드: 통과.
- examples TypeScript 체크: 통과.
- 변경 파일 ESLint: 통과.
- 라우트 manifest 테스트: 4개 통과.
- public API·package export 테스트: 17개 통과.
- 패키지 소비 계약: 14개 통과.
- 전체 Jest: 182 suite 통과, 1 skip; 1,683 테스트 통과, 1 skip.
- demo 빌드와 package surface chunk 검증: 통과.
- 패키지 소비자 검증: ESM import, CJS require, runtime smoke, Vite 소비자 빌드 통과.
- private examples import 계약: 패키지 소비 테스트로 통과.
- 저장소 전체 lint: 이 slice 소유 파일 밖의 기존 에러 16건으로 실패.
- 브라우저 상호작용 검증: 이 세션에서 필요한 in-app 브라우저 제어 도구가 없어 미실행.

## 성능 체크

simulation, render loop, physics, renderer 의존성은 변경하지 않았다. 제품 페이지는 route-split을 유지한다. demo 빌드는 통과했고 기존 대형 vendor chunk 경고는 유지됐다. bundle 축소는 측정 기반 성능 epoch의 몫이다.

## 완료

shell slice는 한계를 보고한 상태로 완료됐다. 다음 migration slice는 Epoch 4 WebGPU 구현 전에 현재 World Model을 보존하며 renderer lifecycle 파단점을 기록하는 Epoch 3 R3F 10 alpha 호환성 spike여야 한다.
