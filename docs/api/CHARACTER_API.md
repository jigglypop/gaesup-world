# Character API

캐릭터 외형/장비 상태(`useCharacterStore`)와 관련 UI(`CharacterCreator`,
`CharacterMenu`, `ActionEquipmentPanel`, `OutfitAvatar`)를 다룹니다. 모두 루트
엔트리(`gaesup-world`)에서 import합니다.

## useCharacterStore

zustand 스토어. 기본적으로 `player`라는 활성 캐릭터 하나를 가지지만, 캐릭터ID를
넘기면 NPC 등 다른 캐릭터의 외형/장비를 독립적으로 관리할 수 있습니다(멀티
캐릭터 장비 API).

```ts
type CharacterState = {
  activeCharacterId: string;
  characters: Record<string, CharacterProfile>; // { appearance, outfits }
  appearance: Appearance;                 // 활성 캐릭터의 미러
  outfits: Record<OutfitSlot, string | null>; // 활성 캐릭터의 미러

  setActiveCharacter: (characterId: string) => void;
  removeCharacter: (characterId: string) => void;
  getProfile: (characterId?: string) => CharacterProfile;

  setName: (name: string, characterId?: string) => void;
  setColor: (key: keyof AppearanceColors, value: string, characterId?: string) => void;
  setFace: (face: FaceStyle, characterId?: string) => void;
  setHair: (hair: HairStyle, characterId?: string) => void;
  equipOutfit: (slot: OutfitSlot, itemId: string | null, characterId?: string) => void;
  resetAppearance: (characterId?: string) => void;
  getEquippedAssetIds: (characterId?: string) => string[];

  serialize: () => CharacterSerialized; // version 3
  hydrate: (data: CharacterSerialized | CharacterSerializedV2 | CharacterSerializedV1 | null | undefined) => void;
};
```

`characterId`를 생략하면 항상 `activeCharacterId`(기본 `DEFAULT_CHARACTER_ID`,
`'player'`)에 적용됩니다. `characterId`를 넘기면 해당 캐릭터의 프로필만
갱신되고, 활성 캐릭터를 바꾸지 않습니다.

### 멀티 캐릭터 장비 예시

```ts
import { DEFAULT_CHARACTER_ID, useCharacterStore } from 'gaesup-world';

const { equipOutfit, setActiveCharacter } = useCharacterStore.getState();

// 플레이어(활성 캐릭터)에는 영향을 주지 않고 'npc-1'에게 도끼를 장착
equipOutfit('weapon', 'npc-axe', 'npc-1');
equipOutfit('top', 'npc-armor', 'npc-1');

// 필요하면 UI 초점을 NPC로 전환
setActiveCharacter('npc-1');
// ... 다시 플레이어로 복귀
setActiveCharacter(DEFAULT_CHARACTER_ID);
```

`getProfile`, `getEquippedAssetIds`도 같은 방식으로 `characterId`를 받습니다.

```ts
const npcProfile = useCharacterStore.getState().getProfile('npc-1');
const npcAssetIds = useCharacterStore.getState().getEquippedAssetIds('npc-1');
```

### 옵션/타입

| 타입 | 설명 |
| --- | --- |
| `OutfitSlot` | `'hat' \| 'top' \| 'bottom' \| 'shoes' \| 'face' \| 'glasses' \| 'weapon' \| 'accessory'` |
| `Appearance` | `{ name, colors: AppearanceColors, face: FaceStyle, hair: HairStyle }` |
| `CharacterProfile` | `{ appearance: Appearance, outfits: Record<OutfitSlot, string \| null> }` |
| `CharacterSerialized` | `{ version: 3, activeCharacterId: string, characters: Record<string, CharacterProfile> }` |
| `CharacterSerializedV2` | 구버전(단일 캐릭터, outfits 전체 슬롯) 직렬화 포맷. `hydrate`가 하위 호환으로 받아들입니다. |
| `CharacterSerializedV1` | 구버전(단일 캐릭터, `LegacyOutfitSlot`만) 직렬화 포맷. |

`DEFAULT_CHARACTER_ID`(`'player'`)와 `EMPTY_OUTFITS`(모든 슬롯이 `null`인 기본
outfits 맵)도 루트 엔트리에서 export됩니다.

## OutfitAvatar

플레이어 위치를 따라다니는 캐릭터 외형 오버레이(모자/머리/의상/무기 등을
간단한 프로시저럴 메시로 표시하는 폴백 레이어)입니다. `characterId`를 넘기면
활성 캐릭터 대신 지정한 캐릭터의 프로필을 렌더링합니다. 단, 위치 자체는 항상
`usePlayerPosition`을 따르므로 플레이어와 물리적으로 다른 위치에 있는 NPC를
그대로 붙여 쓸 수는 없고, 같은 위치에서 다른 프로필을 미리보기(프리뷰) 하는
용도에 적합합니다.

```tsx
import { OutfitAvatar } from 'gaesup-world';

<OutfitAvatar characterId="npc-1" opacity={0.6} />
```

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `headHeight` | `number` | `1.55` | RigidBody 원점에서 머리 위치까지 오프셋 |
| `enabled` | `boolean` | `true` | `false`면 렌더링하지 않음 |
| `opacity` | `number` | `1` | 오버레이 투명도 |
| `characterId` | `string \| undefined` | `undefined`(활성 캐릭터) | 렌더링할 캐릭터 프로필 |

## CharacterMenu / CharacterCreator / ActionEquipmentPanel

외형/장비 편집 UI. 현재는 활성 캐릭터(`activeCharacterId`)만 편집하도록
연결되어 있습니다 — 특정 `characterId`를 대상으로 편집하려면 먼저
`setActiveCharacter(characterId)`로 전환한 뒤 사용하세요.

```tsx
import { CharacterCreator, CharacterMenu } from 'gaesup-world';

<CharacterCreator toggleKey="o" />
<CharacterMenu toggleKey="c" preset="creative" hiddenSlots={['face', 'glasses']} />
```

자세한 props(`renderers`, `classNames`, `labels`, `features` 등)는 타입
`CharacterMenuProps`, `CharacterCreatorProps`, `ActionEquipmentPanelProps`를
참고하세요.

## 직렬화/저장

`serializeCharacterState`/`hydrateCharacterState`(플러그인 저장 바인딩)와
스토어의 `serialize`/`hydrate`는 모두 v3(캐릭터 맵 전체) 포맷을 생성하며, v1/v2
페이로드도 하위 호환으로 읽습니다.

```ts
import { useCharacterStore } from 'gaesup-world';

const blob = useCharacterStore.getState().serialize();
// blob: { version: 3, activeCharacterId, characters: { player: {...}, 'npc-1': {...} } }

useCharacterStore.getState().hydrate(blob);
```

## 스켈레톤 계약 (gaesup-humanoid-v1)

옷/장비 GLB는 제작 시(Blender)에는 각자 armature를 가져도 되지만, **런타임에는
캐릭터당 하나의 skeleton을 모든 SkinnedMesh가 공유**합니다. 이때 bone 이름이
같다는 것만으로는 안전하지 않습니다 — glTF `JOINTS_0`는 인덱스이므로 bone
순서가 다르면 스킨이 엉뚱한 bone에 붙습니다. 이를 위한 계약/검증 유틸이 루트
엔트리에서 export됩니다.

```ts
import {
  GAESUP_SKELETON_ID,          // 'gaesup-humanoid-v1'
  BODY_REGIONS,                // 옷이 가릴 수 있는 논리 신체 영역 목록
  compareSkeletons,            // 'identical' | 'remappable' | 'incompatible'
  remapSkinnedGeometryJoints,  // bone 순서가 다를 때 JOINTS_0 재작성(클론 반환)
  resolveSharedSkeletonBinding,// SkinnedMesh 하나의 공유 바인딩 결정
  getBindPoseHash,             // bind pose 지문 — 리깅 기준 rest pose 검증용
} from 'gaesup-world';
```

- `identical` — bone 이름과 순서가 같음. 캐릭터 skeleton을 그대로 공유.
- `remappable` — 같은 bone들이 순서만 다름. `remapSkinnedGeometryJoints`로
  skinIndex를 재매핑한 클론 geometry로 공유(파츠 렌더러가 자동 수행).
- `incompatible` — bone 누락/중복. 옷 자체 skeleton을 유지하고 dev 경고를
  출력합니다. 이때 옷의 bone들은 씬 그래프에 없으므로 **bind pose로 고정
  렌더링**됩니다(조용한 변형 오염 대신 눈에 보이는 열화). 에셋을
  `gaesup-humanoid-v1` 기준으로 재-export해서 해결하세요.

`PartsGroupRef`/`ModelRenderer`는 캐릭터 skeleton이 주어지면 위 규칙대로 자동
바인딩하므로, 옷 갈아입히기(`equipOutfit`)는 리깅 작업 없이 mesh attach/detach만
일어납니다.

Blender headless로 같은 armature를 공유하는 파츠 GLB를 생성·검증하는 절차는
`docs/guide/CHARACTER_PARTS_PIPELINE.md`(`pnpm assets:parts`)를 참고하세요.

### 착용물 메타데이터 (`WearableMetadata`)

`AssetRecord.metadata`에 다음 필드를 넣어 착용물 계약을 선언할 수 있습니다.

```ts
{
  skeleton: 'gaesup-humanoid-v1',
  deformation: 'skinned',        // 'rigid'(소켓 부착) | 'skinned' | 'secondary'(치마/코트)
  bindPoseHash: '8ff213ab',      // getBindPoseHash 결과와 비교
  hideBodyRegions: ['torso_upper', 'arm_upper_left'],
}
```

`hideBodyRegions`는 착용 중 몸이 옷 밖으로 뚫고 나오는(clipping) 것을 막기 위해
베이스 모델에서 숨길 **glTF 노드명** 목록입니다. 문자열이 노드명과 그대로
일치해야 동작합니다(영역→노드 자동 매핑 없음) — 베이스 모델의 신체 노드를
`BODY_REGIONS` 어휘(`torso_upper` 등)로 명명해 두면 착용물이 이식성 있게
영역을 지정할 수 있습니다. `resolveCharacterParts`가 이를
`Part.hideNodeNames`로 옮기고, `resolveCharacterBaseNodeExclusions`가 기존 슬롯
기반 제외 목록과 합칩니다. 안경/무기처럼 스킨이 필요 없는 것은
`deformation: 'rigid'`로 선언하고 attachment 소켓(`DEFAULT_CHARACTER_ATTACHMENT_SOCKETS`)을
사용하는 편이 훨씬 저렴합니다.

## 예제

- `examples/pages/MinimalExamplePage.tsx` — 멀티 캐릭터 장비 패널(활성 캐릭터
  전환, NPC 장비 장착/해제, `characters` 상태 JSON 표시).
- `examples/components/feature/FeatureAccessPanel.tsx` — 활성 캐릭터 기준
  `equipOutfit`, `setFace`, `toggleCharacterWeapon` 사용.
- `examples/pages/World.tsx` — `CharacterCreator`, `CharacterMenu` 조립 예시.
