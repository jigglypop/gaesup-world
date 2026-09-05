# Build tool modernization

- 목표: Vite 8과 지원 플러그인으로 library ESM/CJS 및 showcase 빌드를 갱신한다.
- source of truth: package.json/lockfile 및 vite.config.ts. public subpath, persistent schema와 기존 dev server 수명은 유지한다.
- 범위: Vite, React SWC, GLSL, SVG, tsconfig paths 플러그인. TypeScript major 및 renderer alpha는 별도 검증한다.
- 위험: Rolldown의 chunk/CJS 변환, legacy decorator 처리, shader import, package consumer 선언 계약.
- 검증: root/build TypeScript, publicApi/packageExports, demo chunk 검증, package consumer ESM/CJS runtime 및 타입 검사.
- 완료 조건: 새 도구로 위 검증을 통과하고 HARNESS.md에 실제 결과와 잔여 경고를 기록한다.
- 근거: 2026-09-05 npm registry 및 https://vite.dev/guide/migration 확인. Vite 8.2.2, React SWC 4.3.3, GLSL 1.6.1, SVG 5.2.0, paths 6.1.1.

## 완료 기록

- paths 플러그인은 최종적으로 제거하고 Vite 내장 resolve.tsconfigPaths로 대체했다.
- root/build TypeScript, publicApi/packageExports 24 tests, demo chunk 검증, 최종 package consumer 타입 및 ESM/CJS runtime smoke 통과.
- 실제 배포 파일의 홈/Creator/CPU performance/World 로드 및 canvas 확인, pageerror 없음.
- 자체 검토: public entry/alias, decorator SWC 처리, library external 및 CJS 출력 계약 유지. demo는 strictExecutionOrder로 수동 chunk의 실행 순서를 보존한다.
- 큰 vendor 청크 및 기존 static/dynamic import 중복 경고는 남으며 후속 번들 최적화 대상으로 기록했다. TypeScript major와 renderer alpha는 전체 modernization 계획에서 계속 추적한다.

## 개발 서버 후속 수정

- 기존 dev server의 classic JSX 변환 오류를 실제 브라우저에서 확인했다. tsconfig의 react-jsx 전환과 TS6133에 근거한 미사용 React import 정리 후 같은 서버에서 GPU 예제가 다시 실행된다.
- build 타입 검사, examplePackageConsumption 16 tests 및 demo 빌드 재검증 통과. 세부 결과는 HARNESS.md GPU viewport / automatic JSX 항목에 기록한다.
