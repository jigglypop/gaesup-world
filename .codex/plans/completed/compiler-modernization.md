# Compiler modernization

## 목표와 범위

- 기본 tsc/typecheck/declaration emit을 TypeScript 7로 이동한다. TypeScript API 소비자(ts-jest, ESLint, AST guard, CJS type postprocess)는 공식 typescript6 compatibility alias를 사용한다. runtime/persistent source of truth와 public export는 유지한다.
- tsconfig의 baseUrl을 제거하고 paths를 명시적 상대 경로로 변경한다. peer override 없이 호환 도구 버전을 설치한다.
- 리스크: compiler option 기본값, DOM/typed-array 타입, declaration output, consumer 검사 스크립트의 CLI 경로.

## 검증

- 기본 및 build typecheck, ESLint, compiler API guard, 전체 Jest.
- declaration build 및 package consumer, demo build.
- 같은 프로젝트의 compiler 실행 시간 측정. 앱 FPS 개선으로 해석하지 않는다.

## 완료 조건

- [x] TypeScript 7 기본 CLI와 TypeScript 6 API 도구가 모두 동작한다.
- [x] 타입/테스트/패키지/demo 검증이 통과한다.
- [x] 측정과 호환 경계, 남은 제한을 HARNESS.md에 기록한다.

## 근거

- https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
- 2026-09-05 registry: typescript 7.0.2, ts-jest 29.4.12 (<7), typescript-eslint 8.69.0 (<6.1).

## 진행 근거

- @typescript/native alias가 tsc 7.0.2를 제공한다. typescript alias의 compatibility package 6.0.2는 tsc6/API 엔진 6.0.3을 제공한다. 이름 충돌 및 peer override 없이 설치했다.
- rootDir/types/상대 paths 명시. GPU upload queue는 SharedArrayBuffer를 허용하는 view 계약을 유지하고, Blob 압축 입력은 실제 ArrayBuffer 기반 배열 타입을 명시했다. hot path 복사를 추가하지 않았다.
- consumer CLI 검사는 native bin/tsc를 사용하고 AST/CJS type postprocess는 typescript alias API를 사용한다.
- root/build tsc, declaration emit/CJS 후처리, API 및 영향 영역 31 tests, ESLint, demo 및 package consumer(ESM/CJS/runtime/type/build)가 통과했다. 전체 Jest 216 suites / 1951 tests 통과, 1 suite / 1 test skipped.
- 동일 워크트리에서 build noEmit 순차 3회: TS6 7192/7655/7520ms, TS7 1218/1254/1176ms. 중앙값 7520→1218ms(약 6.2배). 앱 FPS 또는 다른 장비 결과를 뜻하지 않는다.
