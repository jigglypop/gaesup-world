# 캐릭터·공간 에셋 공통 규격 v1

캐릭터 생성기와 나무·타일·장비 생성기의 **공통 납품 경계**다. 생성 서비스와 무관하게 이 규격으로 정규화한 뒤 같은 검증·카탈로그·편집 경로를 사용한다. 원본 생성 결과를 바로 WORLD에 넣지 않는다.

## 저장 형식과 식별자

- 런타임: glTF 2.0 단일 `.glb`. 버퍼·텍스처를 내장한다. `.blend`, FBX, Unity/Unreal 전용 머티리얼은 제작 원본으로만 보관한다.
- 정식 산출물 스키마는 [AssetManifest](../src/core/assets/production/types.ts), 검증기는 [production/index.ts](../src/core/assets/production/index.ts)가 단일 기준이다. 새 생성기마다 별도 제품 매니페스트를 만들지 않는다.
- `id`는 소문자 kebab-case, `version`은 고정 버전. 원본 URL/제공자 작업 ID/원본 이미지 해시/라이선스/제작자/GLB SHA-256을 기록한다. 같은 파일명 아래 승인된 파일을 무단 교체하지 않는다.
- 구조: `source/` 원본, `work/` 재개 가능한 중간 결과, `package/manifest.json`, `package/lod{0,1,2}.glb`, `package/quality.json`, `evidence/` 화면·검증 결과. 현 CLI의 경로·명령은 `corepack pnpm assets:production --help`로 확인한다.

## 좌표·크기·피벗

| 항목 | 공통 계약 |
| --- | --- |
| 월드 | 미터, 오른손 좌표계, +Y 위, +Z 캐릭터 정면. 루트 position/rotation=0, scale=1 |
| 캐릭터 | 발바닥 중앙이 원점. 기본 바디 기준 신장 2.1m; 모자·머리장식은 별도 bounds. 캐릭터별 체형을 강제로 같은 키로 압축하지 않는다 |
| 의상 | 대응 바디와 같은 좌표·바인드 포즈. 신장만 맞췄다고 호환 처리하지 않는다 |
| 나무·가구 | 지면 접촉 중심이 원점. 최종 크기를 manifest.bounds에 명시. 바닥 아래 뿌리 오프셋은 어댑터에 한 번만 적용 |
| 정사각 타일 | 현재 WORLD 편집 그리드 2m. 윗면 y=0, 바닥 방향 두께, 가장자리 간격 0 |
| 육각 타일 | 별도 `hex` 프로필. 폭/반경/방향을 명시. KayKit hex_grass는 폭 2m, 깊이 약 2.3094m로 정사각 타일을 대체하지 않음 |
| 손 장비 | 손잡이 쥐는 지점이 피벗. 본 로컬 position/rotation/scale을 명시하며 전체 캐릭터 월드 오프셋을 중복 적용하지 않음 |

Blender의 Z-up 변환은 내보내기 때 처리한다. 런타임에서 매번 90도/180도 보정을 추가하지 않는다. 마주 보는 방향은 실제 걷기 화면으로 확인한다.

## 리그·애니메이션·의상

- 리그마다 `rig.id`, 유일한 `joints`, 이름 기준 정렬한 inverse-bind 행렬의 `bindPoseHash`를 갖는다. 모델/모션/의상은 **같은 리그 ID와 바인드 포즈**여야 한다. 관절 배열 순서만 다른 경우에만 JOINTS 재매핑을 허용한다.
- 관절 이름은 `[A-Za-z0-9_-]`로 통일한다. 점·공백 등은 GLTFLoader가 변경하므로 가져오기 단계에서 정규화한다. 중복 이름·누락된 본·NaN 행렬·범위 밖 skinIndex는 실패 처리한다.
- 현재 무료 참조 리그: `kaykit-adventurers-1`, 41개 관절. 오른손 `handslot_r`, 왼손 `handslot_l`, 머리 `head`. 이것을 모든 생성 캐릭터의 자동 호환 리그라고 간주하지 않는다.
- 필수 런타임 클립: `idle`, `walk`, `run`, `jump`, `fall`, `land`. 선택: `interact`, `wave`. 이동 클립은 제자리 이동; 누적 루트 이동·회전을 제거하거나 별도의 명시적 root-motion 모드로 분리한다.
- 캐릭터 교체 시 전체 노드 계층·스켈레톤을 보존하고 대기 동작을 시작한다. 걷기/회전/점프/착지, 반복 교체, 그림자와 컬링을 함께 검사한다.
- **Skinned 의상**: 같은 바인드 포즈·관절 팔레트·정규화된 가중치. 숨길 바디 mesh 이름은 `hideBodyRegions`로 명시한다. 불일치 의상을 고정 메쉬로 붙이고 성공이라고 보고하지 않는다.
- **Rigid 장비**: `metadata.deformation = "rigid"`, `metadata.attachment = { bone, socket, position, rotation?, scale? }`. 이름이 유일한 본을 찾지 못하면 렌더링하지 않고 진단한다. geometry/texture는 공유하고 색 변경 material만 인스턴스가 소유한다.
- WORLD의 현재 4종 선택은 **전신 프리셋 교체**다. 저장 호환을 위해 `outfits.top`에 프리셋 ID를 보관하지만 `characterPreset: true`로 구분한다. 개별 상·하의 피팅 완료나 사용자 원화의 커스텀 캐릭터 생성 완료를 뜻하지 않는다. 별도 avatarId 도입 시 저장 마이그레이션을 동반한다.

## 제작·승인 흐름

1. 사용자 원화/스타일·용도·권리 확인 → 소스 해시와 작업 ID 기록.
2. 생성 또는 라이선스 확인된 원본 가져오기 → 원본 보존. 유료 작업은 명시적 실행 요청·예산 없이 제출하지 않는다. 응답 불명확 시 작업 ID 조회/재개를 먼저 하며 중복 제출하지 않는다.
3. 좌표·피벗·스케일·재질 정규화 → 캐릭터/의상만 리깅·웨이트/리타게팅 → GLB 출력.
4. glTF validator 오류 0, 유한 bounds, 텍스처 누락 0, 리그·소켓·클립 검사 → LOD0/1/2와 단순 충돌체 생성.
5. 앞/뒤/옆, 8방향 이동·점프·넓은 동작의 관통·발 미끄러짐·도구 손잡이를 렌더 확인. 같은 소스를 geometry/material로 공유하고 다수 나무는 instancing한다. 스킨과 애니메이션 상태는 캐릭터마다 소유한다.
6. 기존 품질 게이트에서 provenance/technical/art 승인과 실제 기기 browser evidence 확보 → 카탈로그 등록. 구조 테스트 성공은 아트 승인이나 기기 성능 통과가 아니다.

정식 패키지의 mobile/desktop 예산은 기존 `ASSET_BUDGET_PROFILES`를 따른다. Playwright의 소프트웨어 WebGL 결과는 기능·시각 검증이며 모바일 또는 네이티브 WebGPU 성능 증거가 아니다.

## 지금 실행 가능한 참조 파이프라인

`corepack pnpm assets:references`는 KayKit 제작자 공식 저장소의 고정 커밋에서 CC0 라이선스·원본을 캐시하고 4 캐릭터/3 장비/2 나무/1 육각 타일을 변환한다. 이름 정규화, 내장 무기 제거, 8개 클립 유지, 중복 정리, GLB 검증, 출처·해시·바인드 포즈 매니페스트를 만든다. [스크립트](../scripts/assets/import-kaykit.mjs), [참조 매니페스트](../public/gltf/kaykit/manifest.json).

참조 매니페스트는 **가져오기 영수증**이지 정식 `AssetManifest` 승인서가 아니다. `reference-unapproved` 상태이며 LOD 제작·낱벌 의상·자동 생성 서비스 연결·기기 성능 승인은 남아 있다. 출처: [KayKit Adventurers 공식 저장소](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0), [Medieval Hexagon 공식 저장소](https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0).

## WORLD 정리 범위와 저장 호환

WORLD에는 사과 줍기, 재화, 상점, 경제 퀘스트, 일일 보상 우편, 제작/농사 틱, 핫바를 실행하지 않는다. 라이브러리의 기존 공개 경제 API는 외부 소비자를 위해 유지한다. 개발자용 명시적 예제는 별도 fixture를 등록할 수 있지만 WORLD 부팅에 끼워 넣지 않는다.

캐릭터/공간 저장은 `social-world-v1` 슬롯이다. 새 슬롯이 없으면 기존 `main`에서 등록된 도메인만 읽고 이후 새 슬롯에 저장한다. 이전 `main` 경제 데이터는 삭제·덮어쓰기하지 않는다. 기존 타일·벽·에디터의 편집/저장 경로는 유지한다. 저장된 공간에는 새 기본 배치를 덮어씌우지 않는다.

화면 회귀: Vite 실행 후 `corepack pnpm test:world:browser` (`GAESUP_PROBE_URL` 기본 `http://127.0.0.1:5188`). 결과는 `.tmp/social-world-proof/`에 보관한다.
