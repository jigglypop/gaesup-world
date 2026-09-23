# PRD 코드 인벤토리

2026-09-22. src, examples, scripts, integrations, .github의 소스 파일을 재귀적으로 읽은 정적 목록이다. 생성물과 의존성은 제외한다. 파일 수는 품질 판정이나 수동 감사 완료율이 아니다.

파일 1533개 · 줄 188039개 · 조사 시점 내용 SHA-256 `6c7a83e144b4c703daf0f1972b83fb384bb435357d65b87c3ccd80b051059872`

제품 요구사항과 직접 검토한 경로는 [PRD](./PRD-gaesup-world.md)에 연결한다. 기존 성능 인벤토리는 `scripts/performance/inventory.mjs`로 다시 생성할 수 있다. 이 해시는 조사 시점이며 후속 수정이 포함된 배포 commit과 구분한다.

| 범위 | 파일 | 테스트 파일 | 줄 |
| --- | ---: | ---: | ---: |
| `.github` | 2 | 0 | 173 |
| `examples/engine` | 7 | 0 | 753 |
| `examples/main.tsx` | 1 | 0 | 19 |
| `examples/minihome` | 34 | 4 | 2755 |
| `examples/performance` | 45 | 1 | 4082 |
| `examples/showcase.css` | 1 | 0 | 613 |
| `integrations` | 2 | 0 | 151 |
| `scripts` | 98 | 4 | 11170 |
| `src/__tests__` | 4 | 4 | 1692 |
| `src/admin` | 15 | 0 | 710 |
| `src/admin-entry.ts` | 1 | 0 | 3 |
| `src/assets.ts` | 1 | 0 | 3 |
| `src/avatar` | 9 | 1 | 1520 |
| `src/avatar.ts` | 1 | 0 | 7 |
| `src/blueprints` | 55 | 11 | 5599 |
| `src/building.ts` | 1 | 0 | 3 |
| `src/core/__tests__` | 1 | 1 | 63 |
| `src/core/animation` | 29 | 7 | 2145 |
| `src/core/assets` | 16 | 6 | 1946 |
| `src/core/audio` | 10 | 2 | 917 |
| `src/core/boilerplate` | 58 | 23 | 10287 |
| `src/core/building` | 140 | 47 | 25928 |
| `src/core/camera` | 70 | 16 | 6793 |
| `src/core/catalog` | 9 | 2 | 442 |
| `src/core/character` | 47 | 11 | 5337 |
| `src/core/constants` | 2 | 1 | 459 |
| `src/core/content` | 5 | 1 | 451 |
| `src/core/crafting` | 8 | 2 | 622 |
| `src/core/dialog` | 9 | 2 | 761 |
| `src/core/economy` | 11 | 4 | 938 |
| `src/core/editor` | 100 | 25 | 18391 |
| `src/core/effects` | 3 | 0 | 416 |
| `src/core/error` | 2 | 0 | 104 |
| `src/core/events` | 10 | 1 | 494 |
| `src/core/farming` | 10 | 2 | 832 |
| `src/core/gameplay` | 11 | 2 | 980 |
| `src/core/grid` | 5 | 1 | 324 |
| `src/core/hooks` | 17 | 2 | 1431 |
| `src/core/i18n` | 6 | 1 | 239 |
| `src/core/index.ts` | 1 | 0 | 220 |
| `src/core/initializeBridges.ts` | 1 | 0 | 7 |
| `src/core/input` | 17 | 6 | 1519 |
| `src/core/interactions` | 50 | 13 | 7368 |
| `src/core/inventory` | 8 | 1 | 774 |
| `src/core/items` | 4 | 0 | 81 |
| `src/core/mail` | 8 | 2 | 677 |
| `src/core/motions` | 95 | 24 | 10223 |
| `src/core/navigation` | 10 | 3 | 1732 |
| `src/core/networks` | 66 | 21 | 13786 |
| `src/core/npc` | 31 | 5 | 4039 |
| `src/core/ops` | 3 | 0 | 131 |
| `src/core/perf` | 10 | 4 | 483 |
| `src/core/placement` | 5 | 1 | 504 |
| `src/core/platform` | 5 | 2 | 687 |
| `src/core/plugins` | 15 | 4 | 1853 |
| `src/core/prefab` | 6 | 1 | 443 |
| `src/core/project-settings` | 5 | 1 | 506 |
| `src/core/quests` | 13 | 2 | 1115 |
| `src/core/relations` | 5 | 1 | 295 |
| `src/core/rendering` | 34 | 8 | 3936 |
| `src/core/runtime` | 23 | 17 | 3666 |
| `src/core/save` | 16 | 8 | 1983 |
| `src/core/scene` | 14 | 2 | 976 |
| `src/core/scene-object` | 22 | 7 | 4207 |
| `src/core/simulation` | 7 | 3 | 469 |
| `src/core/stores` | 30 | 2 | 809 |
| `src/core/time` | 10 | 2 | 564 |
| `src/core/tools` | 6 | 1 | 176 |
| `src/core/town` | 9 | 2 | 661 |
| `src/core/types` | 1 | 0 | 48 |
| `src/core/ui` | 31 | 6 | 2972 |
| `src/core/utils` | 12 | 1 | 976 |
| `src/core/wasm` | 1 | 0 | 222 |
| `src/core/weather` | 14 | 3 | 650 |
| `src/core/world` | 57 | 10 | 6656 |
| `src/editor.ts` | 1 | 0 | 7 |
| `src/gameplay.ts` | 1 | 0 | 3 |
| `src/index.ts` | 1 | 0 | 814 |
| `src/navigation.ts` | 1 | 0 | 3 |
| `src/network.ts` | 1 | 0 | 2 |
| `src/next` | 21 | 8 | 2172 |
| `src/next.ts` | 1 | 0 | 2 |
| `src/plugins.ts` | 1 | 0 | 2 |
| `src/postprocessing.ts` | 1 | 0 | 17 |
| `src/runtime.ts` | 1 | 0 | 7 |
| `src/server-contracts.ts` | 1 | 0 | 6 |
| `src/vite-env.d.ts` | 1 | 0 | 37 |

## 검토 방식

- 전체 파일: 범위·크기·테스트 분포와 내용 해시를 수집했다.
- 공개 API: package exports, 루트와 하위 엔트리, core/index, next/index, blueprint exports를 확인했다.
- 핵심 실행: 런타임 소유권, 저장 시스템, 내비게이션 초기화/높이, 씬 문서와 플러그인 계약을 확인했다.
- 이번 배포: minihome UI/model/session/terrain/roomEngine/roomEnvironment/roomVisitors, 잔디·물·날씨 변경, Vite 및 Pages workflow를 확인했다.
- 검증: 전체 Jest 및 미니홈피 실제 브라우저 회귀를 별도 실행했다. 결과는 배포 기록을 따른다.
