# Gaesup World Lifesim MVP 현황

목표는 모동숲/포코피아류 캐주얼 라이프 시뮬레이션 게임을 웹에서 구현 가능한 상태로 유지하는 것입니다. 이 문서는 예전 “구현 계획”이 아니라 현재 구현 현황과 남은 격차를 기준으로 정리합니다.

## 원칙

- 기존 도메인 보강을 우선합니다.
- 한 store는 한 도메인 책임을 가집니다.
- cross-domain 흐름은 hook, bridge, runtime plugin, event로 연결합니다.
- 공개 API 문서는 실제 `src/index.ts`와 package subpath exports 기준으로 유지합니다.

## 현재 구현된 기반

M0-M4로 계획했던 핵심 도메인은 대부분 폴더와 공개 API가 존재합니다.

- Save: `src/core/save/`, `SaveSystem`, `IndexedDBAdapter`, `LocalStorageAdapter`
- Time: `src/core/time/`, `useGameTime`, `useGameClock`, `TimeHUD`
- Items: `src/core/items/`, `getItemRegistry`, seed item 등록
- Inventory: `src/core/inventory/`, `useInventoryStore`, `InventoryUI`, `HotbarUI`
- Interaction prompt: `Interactable`, `InteractionPrompt`, `InteractionTracker`
- Dialog: `src/core/dialog/`, `DialogRunner`, `DialogBox`, dialog store/registry
- NPC schedule: `getNPCScheduler`, `resolveSchedule`, `useNpcSchedule`
- Tools: `ToolUseController`, `useToolUse`, `getToolEvents`
- Economy: `useWalletStore`, `useShopStore`, `WalletHUD`, `ShopUI`
- Notification: `ToastHost`, `useToastStore`, `notify`
- Relations: `useFriendshipStore`, `FRIENDSHIP_LEVELS`
- Quests: `src/core/quests/`, `getQuestRegistry`, `useQuestStore`, `QuestLogUI`
- Mail: `src/core/mail/`, `MailboxUI`
- Catalog: `src/core/catalog/`, `CatalogUI`
- Crafting: `src/core/crafting/`, `CraftingUI`
- Farming: `src/core/farming/`, `CropPlot`
- Weather: `src/core/weather/`, `WeatherEffect`, `WeatherHUD`
- Scene/Room: `src/core/scene/`, `SceneRoot`, `RoomRoot`, `RoomPortal`, room visibility
- Audio: `src/core/audio/`, `AudioControls`, `Footsteps`, ambient BGM hook
- Character: `CharacterCreator`, `OutfitAvatar`, asset store/source
- Input: `TouchControls`
- Performance tier: `usePerfStore`, `detectCapabilities`, `autoDetectProfile`

## 현재 데모 라우트

`examples/App.tsx` 기준:

- `/`: showcase
- `/world`: world + editor + HUD
- `/edit`: edit page
- `/blueprints`: blueprint editor page
- `/network`: multiplayer page
- `/admin/*`: admin-wrapped world page

예전 문서의 `/building` 라우트는 현재 존재하지 않습니다.

## 남은 핵심 격차

### 1. 저장 경로 통합

`SaveSystem`은 domain binding, migration, diagnostics를 지원하지만 world persistence에는 `SaveLoadManager`와 `window.__gaesupStores` 경로가 남아 있습니다.

완료 기준:

- world save/load가 `window.__gaesupStores` 없이 동작
- building, camera, npc, time, inventory 최소 round-trip 테스트 유지
- file import/export는 별도 helper 또는 adapter로 격리

### 2. 공개 API와 문서 정합성

루트 export, subpath export, 내부 경로가 섞이면 사용자가 문서 예시를 그대로 따라 했을 때 깨집니다.

완료 기준:

- README와 `docs/api/*`의 import 예시가 `package.json` exports와 일치
- 내부 경로는 내부 API로 명시
- 새 public API 추가 시 `src/index.ts`, subpath entry, 문서를 함께 갱신

### 3. 라이프심 루프 통합

개별 도메인은 존재하지만 “하루 루프”로 엮는 통합 시나리오가 더 필요합니다.

권장 통합 시나리오:

1. 플레이어가 아이템을 줍는다.
2. 인벤토리와 catalog가 갱신된다.
3. NPC와 대화한다.
4. quest objective가 진행된다.
5. 보상을 받고 wallet/inventory/save에 반영된다.
6. 새로고침 후 진행 상태가 복원된다.

### 4. Scene / Interior 완성도

Scene/room 시스템은 존재하지만, house interior와 village 간 전환을 MVP 흐름으로 고정할 필요가 있습니다.

완료 기준:

- door interaction으로 scene 전환
- fade out/in
- scene scoped object와 cross-scene singleton state 분리
- room visibility 테스트 유지

### 5. Multiplayer Visit

network 도메인과 visit snapshot 경로는 있으나, lifesim MVP 관점에서는 host village snapshot과 guest read-only interaction 정책을 명확히 해야 합니다.

완료 기준:

- host world snapshot format 확정
- guest가 furniture/building을 수정하지 못함
- chat/emote/position sync와 world snapshot sync 경계 문서화

## 다음 작업 순서

1. README/API 문서와 package exports 정합성 유지
2. `SaveSystem` 중심으로 world persistence 통합
3. lifesim 통합 시나리오 테스트 추가
4. `/world` 데모에 pickup, dialog, quest, reward, save round-trip 흐름 고정
5. house interior scene transition을 MVP flow로 연결
6. multiplayer visit snapshot 정책 정리

## 완료 기준

MVP는 개별 도메인 존재가 아니라 아래 흐름이 통합될 때 완료로 봅니다.

- 새 사용자가 README만 보고 기본 월드를 실행할 수 있음
- `/world`에서 아이템, 인벤토리, 대화, 퀘스트, 보상, 저장 복원이 한 루프로 동작
- `/blueprints`, `/network`, `/admin` 라우트가 현재 공개 API 정책과 일치
- save/load가 단일 `SaveSystem` 경로를 중심으로 동작
- 주요 흐름에 단위 테스트 또는 통합 smoke 테스트가 있음
