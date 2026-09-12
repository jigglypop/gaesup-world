# 캐릭터 세부 편집·생성 계약

공통 타입은 `AssetManifest.character`다. 기존 manifest 검증기와 승인 해시에 포함되며, 생성기별 중복 스키마를 만들지 않는다. 이 문서는 **다음 편집기 구현의 계약**이며, 현재 전신 프리셋 선택을 낱벌 옷입히기로 간주하지 않는다.

| 편집 부위 | 생성·납품 요구 | 편집 방식 |
| --- | --- | --- |
| 몸·얼굴 정체성 | `role=base`, `slot=body`, 체형 프로필·리그·바인드 포즈 고정 | 의상 교체 시 유지. 사용자 원화 없이는 개인 캐릭터라고 부르지 않음 |
| 모자·머리카락 | 각각 hat/hair. 머리 본 소켓 또는 동일 리그 스킨 | 독립 선택·색. 모자와 머리카락의 숨김 영역 명시 |
| 상의 | top, 같은 체형·바인드 포즈, 가려지는 바디 영역 | 원본 몸/얼굴을 교체하지 않고 의상만 교체 |
| 바지·치마 | bottom, `variant=pants/skirt` | 같은 하의 슬롯에서 하나만 착용. 치마는 앉기·다리 벌림·달리기 관통 검사와 필요 시 보조 본 |
| 눈 | eyes, iris 재질 채널을 피부와 분리 | 홍채 색/텍스처. 크기·간격·기울기·눈뜸은 실제 morph target이 있을 때만 활성화 |
| 눈썹·입 | eyebrows/mouth, 독립 mesh/material 또는 morph | 선택·색·형태. 얼굴 전체를 착색하는 대체 조작 금지 |

`meshes`, `hideBodyRegions`, `colorChannels`, `morphControls`는 GLB의 실제 이름과 일치해야 한다. 런타임 연결 전 GLB 검사에서 존재 여부를 확인한다. JSON 스키마 검증만으로 실제 피팅이나 morph 존재를 승인하지 않는다. 재질 채널은 서로 같은 재질을 소유하지 않는다. Rigid 부품은 명시적 본 소켓이 필요하다.

저장은 다음 버전에서 `avatarId + bodyProfile + parts + colors + morphs`로 분리한다. 현재 `outfits.top`의 `characterPreset` ID는 avatarId로, 그 외 실제 의상 ID는 그대로 이관한다. 원본 저장을 보존하고 미확인 ID는 조용히 삭제하지 않는다. eyes/eyebrows/mouth는 제작 계약에서 분리했지만 현재 legacy outfit 저장의 face 슬롯을 확장했다고 주장하지 않는다.

## 확보한 원본과 남은 작업

- KayKit 4종: 현재 WORLD 전신 프리셋·애니메이션·손 장비 확인용. 세밀한 얼굴 편집용 기본 바디가 아님.
- [Quaternius Universal Base Characters](https://quaternius.itch.io/universal-base-characters) Standard: 남녀 Superhero 바디 및 헤어·눈썹 원본 확보.
- [Modular Character Outfits Fantasy](https://quaternius.itch.io/modular-character-outfits-fantasy) Standard: 남녀 Peasant/Ranger의 분리된 의상 원본 확보. 유료 전체 팩을 확보한 것으로 표기하지 않는다.

무료 CC0 원본은 `.asset-work/quaternius/`에 보관한다. `scripts/assets/download-quaternius.cjs`로 재개할 수 있다. Quaternius와 KayKit은 다른 리그다. 현재 WORLD 바디에 억지로 부착하지 않는다. **바디 선택·스타일 정합, 리그 정규화, 얼굴 morph 제작, 의상 피팅 및 세부 편집 UI 연결은 미완료**다.

파이프라인: 원화·권리 확인 → 부분별 생성 작업 ID/원본 해시 저장 → 바디·의상 동일 리그로 정규화 → GLB 실제 mesh/material/morph 검사 → 바인드 포즈·애니메이션·관통 검사 → 다각도 화면 검수 → 정식 manifest/품질 게이트 → 편집기에 지원되는 조작만 노출.
