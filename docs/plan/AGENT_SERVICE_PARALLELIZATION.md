# 에이전트 병렬 서비스 구현 판단

## 결론

가능하다. 이 저장소는 도메인별 `src/core/<domain>` 구조, runtime plugin, save binding,
server host, network contract가 이미 나뉘어 있어서 여러 에이전트가 병렬로 작업하기 좋은
편이다. 다만 도메인 내부 구현은 나눠 맡기기 쉽고, 공개 API와 예제 조립은 한 명의 통합
담당이 마지막에 모아야 한다.

## 병렬 작업에 적합한 영역

- 서버: `server/index.js`, `server/main.py`, `server/policy.js`
- 네트워크 코어: `src/core/networks/core`, `src/core/networks/adapter`,
  `src/core/networks/bridge`, `src/core/networks/visit`
- 네트워크 UI: `src/core/networks/components`, `src/core/networks/hooks`,
  `examples/pages/NetworkMultiplayerPage.tsx`
- 단일 도메인 store/plugin:
  `inventory`, `relations`, `quests`, `mail`, `catalog`, `crafting`, `farming`,
  `weather`, `events`, `town`, `audio`, `i18n`, `economy`
- 서버 런타임 계약: `src/core/platform/serverHost.ts`, `src/server-contracts.ts`

## 현재 서비스 포트

- Vite 예제: `http://127.0.0.1:5174`
- WebSocket 멀티플레이 서버: `ws://localhost:8090`
- NPC policy 서버: `http://localhost:8091/policy/step`

예제의 reinforcement adapter도 기본값으로 `http://localhost:8091/policy/step`을 사용한다.
다른 주소를 쓰려면 `VITE_RL_POLICY_ENDPOINT`로 덮어쓴다.

## 병렬 작업 시 충돌 위험이 큰 파일

- `src/index.ts`
- `examples/pages/runtime.ts`
- `examples/pages/World.tsx`
- `examples/App.tsx`
- `examples/packageSurface.ts`
- `src/core/plugins/types.ts`
- `src/core/plugins/createPluginContext.ts`
- `src/core/runtime/createGaesupRuntime.ts`
- `src/core/save/core/SaveSystem.ts`
- `src/core/world/persistence/saveSystem.ts`
- `package.json`, `vite.config.ts`, `tsconfig.json`,
  `scripts/copy-cjs-types.cjs`, `src/__tests__/packageExports.test.ts`

## 권장 역할 분담

1. 도메인 구현 에이전트는 자기 `src/core/<domain>`과 해당 테스트만 맡는다.
2. 서버 에이전트는 `server/`와 서버 실행 문서만 맡는다.
3. 네트워크 에이전트는 protocol/adapter/core/hooks/components를 하위 영역별로 나눈다.
4. 통합 에이전트 한 명만 공개 export, 예제 runtime, route, package export map을 만진다.
5. 새 save domain은 작업 시작 전에 plugin id, save key, service id를 예약한다.

## 실제로 여러 에이전트에게 맡길 때의 작업 패키지

### 서버 패키지

- 담당 파일: `server/index.js`, `server/main.py`, `server/policy.js`, `server/pyproject.toml`
- 산출물: 멀티플레이 room server, policy endpoint, provider 설정, 서버 로그/헬스체크
- 금지: `src/index.ts`, `examples/pages/runtime.ts` 직접 수정

### 네트워크 코어 패키지

- 담당 파일: `src/core/networks/core`, `src/core/networks/adapter`,
  `src/core/networks/bridge`, `src/core/networks/visit`
- 산출물: command contract, snapshot/delta, message queue, connection manager
- 금지: route/UI 전체 조립을 직접 마무리하지 않는다

### 네트워크 UI 패키지

- 담당 파일: `src/core/networks/components`, `src/core/networks/hooks`,
  `examples/pages/NetworkMultiplayerPage.tsx`
- 산출물: 접속 폼, 디버그 패널, 원격 플레이어 표시, 예제 화면
- 조건: import는 `gaesup-world/network` 공개 엔트리만 사용한다

### 도메인 패키지

- 담당 파일: `src/core/<domain>`
- 산출물: `types.ts`, `stores`, `plugin.ts`, `index.ts`, 도메인 테스트
- 조건: save key, service id, plugin id를 먼저 예약한다

### 통합 패키지

- 담당 파일: `src/index.ts`, `examples/pages/runtime.ts`, `examples/pages/World.tsx`,
  `examples/App.tsx`, export map 계열
- 산출물: 공개 API, 예제 접근 경로, runtime plugin 등록, 최종 검증
- 이 패키지는 병렬 작업의 마지막에 한 명이 맡는다

## 체크포인트

- 공개 API로 import 가능한가?
- `examples/`에서 내부 `src/` 경로 없이 접근 가능한가?
- runtime plugin이면 `examples/pages/runtime.ts`에 등록됐는가?
- UI면 `World.tsx`, editor panel, 독립 route 중 하나에서 실제로 보이는가?
- save key 중복이 없는가?
- package subpath를 추가했다면 export map, alias, paths, CJS type copy, export 테스트가 맞는가?

## 추천 검증

```bash
corepack pnpm test -- src/core/<domain> --runInBand
corepack pnpm test -- src/__tests__/publicApi.test.ts --runInBand
corepack pnpm test -- src/__tests__/packageExports.test.ts --runInBand
corepack pnpm build:types
corepack pnpm test:demo
corepack pnpm build
```

서버 작업까지 있으면 별도로 다음을 확인한다.

```bash
node server/index.js
corepack pnpm policy:dev
```
