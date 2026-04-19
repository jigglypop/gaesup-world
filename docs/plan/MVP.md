# Gaesup World — Lifesim MVP Plan

> 목표: 현재 `src/core/*` 위에 모동숲(Animal Crossing) / 포코피아류
> 카주얼 라이프 시뮬레이션 게임을 웹에서 구현 가능한 상태로 끌어올린다.
> 본 문서는 단계별 마일스톤, 모듈 위치, 데이터 모델, 의존 관계, 산출물을 정의한다.

---

## 0. 원칙

- 기존 모듈 구조(`src/core/<domain>`) 보강 우선. 신규 도메인은 같은 규칙으로 추가.
- 단일 책임. 한 store = 한 도메인. cross-domain은 hooks/bridge로.
- DRY: Item/Inventory/Save는 공통 schema 한 벌. 시스템은 그 위에서만 동작.
- 신규 코드는 toon 모드/일반 모드 양쪽에서 깨지지 않게 props로 분기.
- 새로 만들 핵심 도메인(소스 위치):
  - `src/core/inventory/`
  - `src/core/items/`
  - `src/core/save/`
  - `src/core/time/`
  - `src/core/weather/`
  - `src/core/dialog/`
  - `src/core/quest/`
  - `src/core/economy/`
  - `src/core/audio/`
  - `src/core/scene/` (dimension manager)
- 기존 도메인 활용/확장:
  - `building`, `npc`, `interactions`, `motions`, `camera`, `ui`, `networks`, `animation`, `rendering`

---

## 1. 마일스톤

### M0 — 기반 (1주)
선결 인프라. 다른 모든 시스템이 깔리는 토대.

- **Save / Persistence**
- **Time / Calendar**
- **Item registry**
- **Inventory + Hotbar**
- **Interaction prompt UI**

### M1 — 코어 루프 (2주)
플레이어가 매일 할 일이 생기는 최소 루프.

- **Dialogue tree**
- **NPC schedule (시간 기반 위치/행동)**
- **Tool 시스템 (도끼/삽/물뿌리개 중 1개 선행)**
- **Tree chop / Foraging (1세트)**
- **Wallet (벨)**
- **Shop UI (구매/판매)**
- **Notification toast**

### M2 — 콘텐츠 풍부도 (2주)
"이 게임을 왜 켜는가" 콘텐츠.

- **Friendship / Affinity + Gift**
- **Quest / Daily Task**
- **Mailbox / Letter**
- **Catalog (도감)**
- **Fishing 또는 Bug catching 1종**
- **Crafting / DIY recipe**

### M3 — 라이브 / 멀티 (2주)
세션 지속성과 사회성.

- **House interior 차원 전환 (Scene manager)**
- **Day/Night + Season visual binding**
- **Weather (Rain/Wind)**
- **Multiplayer visit (기존 networks 활용)**
- **AudioManager + 시간별 BGM**

### M4 — 마감 (지속)
- Character creator
- Outfit slot
- 잔디 누름 / 발자국 / fog 강화
- LUT/color grading
- Mobile/Touch 컨트롤
- i18n
- Performance tier auto-detect

---

## 2. M0 상세 설계

### 2.1 `src/core/save/`

목표: 모든 도메인 store의 직렬화/복원을 한 곳에서.

```
src/core/save/
  types.ts          // SaveSchema, version, slot
  core/SaveSystem.ts
  adapters/IndexedDBAdapter.ts
  adapters/LocalStorageAdapter.ts
  hooks/useAutoSave.ts
  index.ts
```

- 인터페이스
  ```ts
  type SaveAdapter = {
    read(slot: string): Promise<SaveBlob | null>;
    write(slot: string, blob: SaveBlob): Promise<void>;
    list(): Promise<string[]>;
    remove(slot: string): Promise<void>;
  };

  type SaveBlob = {
    version: number;
    savedAt: number;
    domains: Record<string, unknown>;
  };
  ```
- 각 도메인 store는 `serialize()` / `hydrate(state)`만 노출.
- 마이그레이션: `migrations[fromVersion] -> blob` 체인.
- AutoSave: 5분 주기 + 씬 전환 + `beforeunload`.

### 2.2 `src/core/time/`

```
src/core/time/
  types.ts          // GameTime, Season, Weekday
  core/Clock.ts
  stores/timeStore.ts
  hooks/useGameTime.ts
  hooks/useTimeOfDay.ts
  index.ts
```

- 1 real minute = 1 game hour (조절 가능). 실시간 옵션도 지원.
- store 필드: `epochSec, year, month, day, hour, minute, season, weekday`.
- `useGameTime((t) => t.hour)` 셀렉터로 구독.
- 조명/스카이박스/머티리얼 tint는 별도 시스템이 구독.

### 2.3 `src/core/items/`

```
src/core/items/
  types.ts          // ItemDef, ItemId, ItemCategory, Rarity
  registry/ItemRegistry.ts
  data/items.ts     // 시드 아이템 정의 (목재, 사과, 도끼 등)
  index.ts
```

- ItemDef
  ```ts
  type ItemDef = {
    id: ItemId;
    name: string;
    icon: string;
    category: 'tool' | 'material' | 'food' | 'fish' | 'bug' | 'furniture' | 'misc';
    stackable: boolean;
    maxStack: number;
    buyPrice?: number;
    sellPrice?: number;
    description?: string;
    toolKind?: 'axe' | 'shovel' | 'net' | 'rod' | 'water';
    durability?: number;
  };
  ```
- 모든 다른 시스템은 `ItemId` 만 사용. ItemDef는 registry로 lookup.

### 2.4 `src/core/inventory/`

```
src/core/inventory/
  types.ts
  stores/inventoryStore.ts
  hooks/useInventory.ts
  hooks/useHotbar.ts
  components/InventoryUI/index.tsx
  components/HotbarUI/index.tsx
  index.ts
```

- store
  ```ts
  type Slot = { itemId: ItemId; count: number; durability?: number } | null;
  type InventoryState = {
    slots: Slot[];        // size N
    hotbar: number[];     // indices
    equippedHotbar: number;
    add(itemId, count): number;   // 남은 수량
    remove(slot, count): boolean;
    move(from, to): void;
    getEquipped(): Slot;
  };
  ```
- 인벤 UI는 토글(`I`키). 슬롯 드래그/드롭.
- 핫바 UI는 항상 바닥. `1~5` 키로 선택. 마우스 휠 옵션.

### 2.5 Interaction prompt UI

- `src/core/ui/components/InteractionPrompt/`
- 플레이어 근처 `InteractableObject`가 있으면 화면 하단에 `[E] 줍기` 표시.
- `InteractableObject` 타입은 `interactions` 도메인에 추가:
  - `{ id, label, distance, key, onActivate }`
- `useInteractionTarget()`이 매 프레임 nearest를 반환.
- 키 입력은 기존 `interactions/bridge/InteractionBridge`에 통합.

---

## 3. M1 상세 설계

### 3.1 `src/core/dialog/`

```
src/core/dialog/
  types.ts        // DialogNode, DialogChoice, DialogTree, DialogVar
  core/DialogRunner.ts
  stores/dialogStore.ts
  data/                 // npcId 별 트리 정의 (or JSON)
  components/DialogBox/index.tsx
  index.ts
```

- DialogNode
  ```ts
  type DialogNode =
    | { kind: 'line'; speaker: string; text: string; next?: string }
    | { kind: 'choice'; choices: { label: string; next: string; if?: Cond }[] }
    | { kind: 'set'; var: string; value: number; next: string }
    | { kind: 'reward'; itemId: ItemId; count: number; next: string }
    | { kind: 'end' };
  ```
- 변수/조건은 `dialogStore.vars` (npc별 friendship 등도 여기 포함 가능).
- DialogBox는 카메라 잠시 줌인 + UI 모달.
- NPC `onActivate` → `DialogRunner.start(npcId, treeId)`.

### 3.2 NPC schedule

- `src/core/npc/core/NPCScheduler.ts`
- npcDef
  ```ts
  type NPCSchedule = Array<{
    fromHour: number;
    toHour: number;
    location: [number, number, number];
    activity: 'idle' | 'walk' | 'work' | 'sleep';
    dialogTreeId?: string;
  }>;
  ```
- `useGameTime` 구독 → 현재 슬롯 결정 → 위치/애니메이션/대화트리 업데이트.

### 3.3 Tool 시스템

- 인벤토리에서 `category === 'tool'` 인 슬롯이 hotbar 활성일 때 `equippedTool` 결정.
- 캐릭터 hand bone에 mount: `motions/entities`에 `ToolAttachment` 컴포넌트 추가.
- 입력: 좌클릭 또는 `F` → `interactions` 도메인에서 `tool:use` 이벤트 송신.
- 대상 판정: 카메라/플레이어 forward ray + 거리 게이트.

### 3.4 Tree chop / Foraging

- 새 컴포넌트: `src/core/world/objects/TreeObject/`
  - `health`, `kind` (apple/oak/cedar), `growthStage` (0..3), `lastChoppedAt`.
  - `onToolUse('axe')` → hp -= 1, hp <= 0 → fall 애니메이션 + `wood ×3` drop.
  - 며칠 후 재성장 (Time 구독).
- Foraging은 spawner: 하루마다 random 위치에 fruit/shell/branch 생성.

### 3.5 Wallet / Shop

- `src/core/economy/`
  ```
  stores/walletStore.ts   // bells, addBells(n), spend(n)
  stores/shopStore.ts     // dailyStock: ItemId[]
  components/ShopUI/index.tsx
  hooks/useShop.ts
  ```
- 일일 입고는 Time 일자 변경 트리거에서 재생성.
- ShopUI: 좌측 stock, 우측 inventory, 가운데 거래 버튼.

### 3.6 Notification

- `src/core/ui/components/Toast/` + 단일 store.
- `notify({ kind: 'info'|'reward'|'mail', text, icon })` → 우상단 슬라이드.

---

## 4. M2 상세 설계

### 4.1 Friendship / Gift
- `dialog`의 `vars`에 `friendship[npcId]` 누적.
- Gift는 inventory item을 NPC drop area에 던지기 또는 대화 옵션 → reaction 분기.

### 4.2 Quest
- `src/core/quest/`
  ```
  types.ts          // Quest, Objective(kind: collect|talk|deliver|kill)
  stores/questStore.ts
  data/quests.ts
  components/QuestLog/index.tsx
  ```
- 이벤트 버스 (interactions `EventManager`) 구독 → objective 진행도 갱신.

### 4.3 Mailbox
- `src/core/mail/`
- 매일 자동 우편 + npc 선물 우편.
- HouseInterior 입구의 mailbox 오브젝트와 연결 (Scene에서 placement).

### 4.4 Catalog (도감)
- 잡은 fish/bug/foraging 기록. inventory의 `firstAcquired` 이벤트에서 자동.
- UI: 카테고리 탭 + 수집률.

### 4.5 Fishing / Bug
- 미니게임 컴포넌트 1개씩.
- Fishing: 그림자 spawner(Water 영역) + 낚싯대 cast + 입질 timing.
- Bug: 지형 위 spawner + 그물 swing AOE.

### 4.6 Crafting
- `src/core/crafting/`
- recipe `{ inputs: [{itemId, count}], output: itemId, stationKind? }`.
- 작업대 오브젝트와 연결. UI는 inventory와 sibling 모달.

---

## 5. M3 상세 설계

### 5.1 Scene / Dimension manager
- `src/core/scene/`
- `SceneId` (`village`, `houseInterior:<playerId>`, `island:<id>`).
- 진입 트리거(현관문 InteractableObject) → fade-out → unmount + load → fade-in.
- Inventory/Time/Save는 cross-scene singleton, 월드 객체만 scene-scoped.

### 5.2 Day/Night + Season binding
- `src/core/rendering/sky.ts` (신규)
  - directionalLight color/intensity/angle = `f(hour)`.
  - Environment preset hot-swap or HDR blend.
- Season binding:
  - `Sakura.blossomColor`, `Snowfield.visible`, `Grass.tipColor` 등을 store 셀렉터로 자동 변경.
  - 상위 컴포넌트가 prop으로 전달 (DRY).

### 5.3 Weather
- `src/core/weather/`
- `weatherStore`: `{ kind: 'clear'|'rain'|'snow', intensity, wind }`.
- Rain: GPU particle (Snow 컴포넌트와 동일 패턴 재사용).
- Wind은 grass/flag/sakura에 전파 (uniform 업데이트).

### 5.4 Multiplayer visit
- 기존 `networks/` 위에 visit-room 개념 추가:
  - `room:<hostPlayerId>` 채널.
  - host 마을 스냅샷 → guest sync.
  - guest는 read-only 가구 + chat/emote만.

### 5.5 Audio
- `src/core/audio/`
  ```
  core/AudioManager.ts
  stores/audioStore.ts
  data/tracks.ts        // hourly bgm, sfx ids
  hooks/useSfx.ts
  ```
- 시간대별 BGM crossfade (5초).
- 풋스텝: 발이 닿은 surface tag(`grass`/`sand`/`wood`)에 따라 sfx pick.

---

## 6. 의존 그래프 (요약)

```
Save  <-  Time, Inventory, Wallet, NPC, Quest, Mail, Catalog, Building, Dialog vars
Items <-  Inventory, Shop, Crafting, Quest, Catalog, Tools
Time  <-  NPC schedule, Sky, Weather, Shop dailyStock, Tree growth, Mail delivery
Inventory <- Hotbar, Tools, Shop, Crafting, Pickup, Quest objectives
Dialog <- NPC, Quest hooks, Shop entry
Scene <- Building (interior), Mailbox, Doors
Audio <- Time, Weather, Surface tags, UI events
```

---

## 7. 산출물 / 완료 기준

각 마일스톤은 다음을 모두 만족할 때 완료.

- 도메인 폴더에 `index.ts` 배럴 + `types.ts` + 핵심 store/hook/컴포넌트.
- `examples/pages/World.tsx`에서 사용 가능한 데모 시나리오 1개 이상.
- 단위 테스트: store reducer, save migration, scheduler 시간 분기.
- toon ON/OFF 양쪽에서 시각 깨짐 없음.
- 새 컴포넌트는 `src/index.ts` re-export.

---

## 8. 작업 순서 (M0 시작 시)

1. `src/core/time/` 스캐폴드 + `useGameTime` + 데모 HUD 표시.
2. `src/core/save/` 스캐폴드 + IndexedDB 어댑터 + Time만 우선 hydrate.
3. `src/core/items/` registry + 시드 데이터 (apple, wood, axe, shovel, bell-icon).
4. `src/core/inventory/` store + InventoryUI + HotbarUI.
5. `interactions`에 InteractionPrompt + nearest target hook.
6. World.tsx에 통합:
   - 시간 HUD
   - 인벤/핫바 UI
   - 시범 Pickup 오브젝트 (사과 1개 줍기 가능)
7. Save round-trip 검증 (인벤토리 + 시간이 새로고침 후 복원).

이 7단계가 끝나면 M0 완료. 이후 M1로 진입.
