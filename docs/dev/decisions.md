# 결정 기록

2026-09-26~27 정리 작업에서 내린 결정과 근거다. 다음 세션이 같은 논의를 반복하지 않게 하려는 기록이며, 커밋 해시로 실제 변경을 찾을 수 있다. 원칙은 [principles.md](principles.md)에 일반화해 두었다.

## 수치 요약

| 항목 | 정리 전 (`f2b077d1`) | 지금 (`2fcfcece`) |
|---|---:|---:|
| `src` 비테스트 줄 수 | 108,683 | 94,917 |
| `src` 테스트 포함 줄 수 | 168,343 | 147,296 |
| `examples` 줄 수 | 3,492(자체 엔진 minihome) | 141(공개 API 최소 마을) |
| 루트 export | 1,097 | 946 |
| 런타임 생성 객체(`const x = create…/new…/get…` 줄 기준) | 55 | 43 |
| `src/index.ts` | 812줄 | 3줄 |
| jest | 3,200개 | 2,639개(지운 기능의 테스트 제외, 전부 통과) |

## 결정

### 옛 minihome을 지우고 공개 API만 쓰는 최소 예제로 (P0, `8e21fc39`)
- 옛 minihome은 엔진 번들의 약 10%만 쓰고 렌더러·카메라·입력·아바타·멀티플레이를 자체 엔진으로 구현했다. 예제의 목적(엔진 증명)에 맞지 않아 사용자가 지웠다.
- 남은 빌드·릴리스 참조(프로브 스크립트, SSE 방 서비스, vite 플러그인, 워크플로 단계, README)를 걷어냈다. 데모 검사는 "예제 라우트가 lazy이고 월드 라우트가 에디터·후처리를 미리 싣지 않는다"로 새 예제에 맞췄다.
- 이 검사가 라이브러리 결함을 드러냈다: `GaesupWorldContent`가 후처리를 정적으로 import해 기본 월드도 후처리 스택을 받았다. 후처리를 켰을 때만 lazy로 불러오게 고쳤다(운영 라우트 −103KB).

### 소비자 없는 병렬 구현 삭제 (`8e21fc39`)
- `src/next`(1,168줄): 자체 ECS·렌더 그래프·GPU 인스턴싱. 트리 안 소비자 0, `rendering/gpuInstanceBatch`와 중복.
- `src/admin`: 로그인·토큰·API 빌더 앱. 3D 엔진과 무관.
- 어느 진입점에서도 닿지 않는 파일 4개와 고아 `scripts/fixtures`.

### `blueprints`는 유지
- 전사·마법사·카트 정의와 별도 ECS·에디터(3.3k줄)로 삭제 후보였다. 권한 분류기가 `package.json` exports와 설정을 함께 바꾸는 삭제를 막았고, 이후 승인 질문에서 사용자가 선택하지 않았다. 코어 소비자는 `useBlueprintEntity` 하나다.

### 카메라 충돌 붕괴 수정 (`1320ce42`)
- 3인칭 카메라가 가끔 캐릭터 몸 안으로 들어갔다(브라우저 7번 중 2번). 충돌 탐사를 발 위 0.15m에서 시작해, 물리 바닥보다 조금 높게 그려지는 잔디 바닥이나 발 뒤 단차에 거리 0으로 막혔다. 탐사를 몸 중심 높이(1m)에서 시작하게 했다. 언리얼 SpringArm이 캡슐 중심에서 트레이스하는 것과 같은 원리다.

### 방향 재설정: 웹판 Unity/Unreal (`304ed9c5`)
- 사용자 지시: gaesup-world는 웹판 Unity/Unreal이고 미니홈·포코피아는 예제일 뿐이다. WebGPU로 전부 가고, upstream이 제공하는 기능은 빼고 최신화한다. 문서는 `docs/`에 둔다.

### 생활 게임 도메인 삭제 (DEL-1, `16cd9d45`)
- farming, economy, inventory, items, quests, mail, crafting, events, catalog, town, relations와 이것만 쓰던 tools, 채집 오브젝트(나무·낚시·곤충)를 지웠다. 동물의 숲식 게임 로직이라 엔진 코어가 아니고, 월드마다 전부 즉시 만들어졌다.
- 대화·게임플레이 규칙·NPC 두뇌는 엔진 기능이라 남기고 장르 결합만 끊었다. 게임은 `custom` 확장점으로 규칙을 붙인다.
- 플레이어 진행 도메인은 게임이 `domains` 옵션으로 정한다(기본 `i18n`).
- 루트 `src/index.ts`의 812줄 명시 재수출은 `export * from './core'`와 중복이라 3줄로 줄였다. export snapshot으로 사라진 이름이 모두 지운 모듈 것인지 확인했다.
- 공개 API 테스트를 소스 텍스트 검사에서 실제 export(값)와 컴파일러(타입) 검사로 바꿨다. 배럴 형태가 바뀌어도 깨지지 않는다.
- 복원 가드 테스트는 수단을 바꾼 뒤 가드를 꺼도 통과하는 것을 발견해, 굴림 횟수로 판정하도록 고쳤다(mutation 확인).

### 승인된 공개 API 삭제 (DEL-2, `2fcfcece`)
- NPC 네트워크 섬(브리지·시스템·매니저·커넥션 풀·메시지 큐·hook 5개·패널 2개·설정 store): 서로만 참조하는 가짜 네트워크였다. `NetworkConfig`는 멀티플레이 클라이언트가 읽는 8개 필드만 남겼다.
- `core/ops`(RBAC), 샘플 플러그인 3개, 플러그인 컨텍스트의 `catalog`·`quests` 슬롯.
- deprecated: `usePhysics`, `BuildingBridge`, `WorldContainer` 별칭, `useGaesupContext`, `useCursorState`, 읽히지 않는 `WorldContainerProps` 11개, 오타 prop `onDestory`.

### 참조 없는 자산·도구 정리 (CLEAN-1)
- `public/`의 참조 없는 파일(글꼴 OTF 15MB, Draco 디코더, 옛 텍스처·사이트맵, farm 라이브러리)과 런타임이 싣지 않는 잔디 wasm crate를 지웠다. Pretendard는 웹에 맞는 woff2로 EX-1에서 싣는다.
- UI 라우트가 사라져 쓸 수 없던 `assets:studio` 서버를 지웠다. 생산 자산 CLI(`assets:production`)는 남긴다.
- 라이브러리 빌드가 Vite 기본값대로 `public/` 전체를 `dist`에 복사하던 것을 `wasm/gaesup_core.wasm`만 내보내게 했다(`dist` 33MB → 9.4MB).
- dev 서버가 `/gltf/*`를 옛 빌드 산출물에서 먼저 찾던 미들웨어를 지웠다. 같은 이름의 낡은 파일이 `public/`보다 먼저 나갈 수 있었다.

### 런타임별 격리 (ISO-1)
- 오류: 런타임이 전역 sink를 바꾸던 방식을 없앴다. 런타임이 가진 경계(시계, 플러그인 이벤트 버스, 저장, 상호작용 브리지, 캔버스 프레임 스케줄러)가 만들어질 때 `runtime.reportError`를 받고, 이 함수는 setup부터 dispose 완료까지만 `onError`로 보낸다. A·B 순서로 해제하면 종료된 A의 handler가 되살아나던 결함이 구조적으로 사라졌다.
- 자산: `createAssetStore()`로 런타임마다 카탈로그와 로드 세대를 둔다. `useAssetStore`는 scoped store가 됐고 `AvatarProvider`의 기본 조회도 가장 가까운 월드를 본다. 선택자 캐시는 store의 `ids` 배열별로 둬 월드끼리 캐시를 밀어내지 않는다.
- 대화: 런타임마다 `dialogRegistry`. `getDialogRegistry()`는 런타임 없는 legacy 경로에만 남는다.
- 수용 시나리오 S-H08을 실측으로 green: 두 런타임에서 자산·대화·NPC·오류를 조작하고 게임패드 폴링과 시계 소비자를 켠 뒤 해제한다. 공유 상태 0, 남은 window·document 리스너 0(활성 13), 남은 타이머 0(활성 2). jsdom의 `window`는 자체 리스너 메서드를 가져 `EventTarget.prototype`을 가로채면 보이지 않는다. 처음에는 활성 리스너가 4개로 잡혀 이 함정을 찾았다.

### 동작하지 않던 설정·트리거·입력 살리기 (DEAD-1 앞부분)
- 지우지 않고 살릴 수 있는 것부터 살렸다. 건축 안개(`DynamicFog`)와 바다 표면, `GaesupWorld`의 `wheelUrl`·`ridingUrl`, `connect()`의 모델 URL, 카메라 `fixedPosition`·`bounds`(기본 bounds는 없앴다: 한 번도 적용된 적 없는 값이 갑자기 효력을 갖지 않게), 1인칭 기본 눈높이(8m→2m, 앞 15m→0.45m), 클릭 이동은 왼쪽 버튼만.
- 규칙 엔진 트리거를 런타임이 보낸다: 상호작용 발동 → `interaction`, 게임 시각 변경 → `timeChanged`, 영역 진입 → `enterArea`. 영역은 물리 센서가 아니라 고정 틱마다 플레이어 위치로 상자를 검사하는 방식이다(결정적이고 헤드리스에서도 돈다).
- 조작 캐릭터의 키는 기본 입력 액션 표에서 파생한다. 컨트롤러가 입력 액션을 직접 읽게 바꾸는 큰 작업 대신, 키 정의를 한 곳으로 모으는 작은 변경으로 방향키 결함을 없앴다.
- 에디터의 기본 규칙 패널을 월드 엔진에 묶었다. 시험 실행은 미리보기로 둬 보상이 나가지 않는다.
- 남은 항목은 대부분 공개 타입 삭제라 승인을 받아 처리한다.

### 방문 스냅샷 원자적 적용 (ISO-2)
- `atomic: true`는 적용과 되돌리기(지금 상태를 `serialize()`한 값)를 모두 먼저 준비하고, 적용 중 한 도메인이 던지면 그 도메인과 적용한 도메인을 역순으로 되돌린다. 결과에 `failed`와 `unrestored`를 담는다. 성공 결과의 모양은 그대로라 기존 호출자는 바뀌지 않는다.
- 복귀 지점의 `restore()`는 일부러 원자적이지 않게 했다. 집으로 돌아가다 한 도메인이 실패했다고 나머지를 방문 상태로 되감으면 플레이어가 남의 월드에 갇힌다.
- `useVisitRoom`은 전체가 적용됐을 때만 성공을 돌려주고, 첫 적용이 실패하면 자동 저장을 다시 켜며, 실패를 가장 가까운 런타임에 보고한다. 롤백을 끈 변이에서 새 테스트 2개가 실패하는 것을 확인했다.

### 세션 전 작업 커밋 (`191699a2`)
- 작업 트리에 있던 `IdleFrameRate`(입력이 없으면 낮은 fps로 그림)와 `NPCSimulation`의 `setNavigation`·`face`·`nextEventAt`을 테스트가 통과하는 상태로 커밋했다. `IdleFrameRate`는 아직 월드에 기본 장착되지 않는다(PERF).

## 보류하거나 되돌린 것

- **GPU-1(WebGPU 전면)**: WebGL 전용 공개 export(`ColorGrade`, `LutOverlay`, `ToonOutlines`, `Outlined`, LUT 도우미)와 GLSL 경로 삭제를 사용자가 보류했다(2026-09-27). 다시 요청할 때까지 착수하지 않는다.

- **런타임 기본 소유**: `GaesupWorld`가 런타임을 직접 만들고 setup/dispose하게 하는 변경을 시작했다가, 테스트 갱신 전에 사용자 지시로 PRD부터 다시 짜면서 되돌렸다. 정적 store API(`useXStore.getState()`)로 데이터를 넣던 코드가 런타임 소유 store와 어긋나는 문제를 함께 풀어야 한다(LIB-1, ISO-1).
- **`World` 별칭**: `GaesupWorld`와 같은 컴포넌트의 네 번째 이름이지만 승인 목록에 없어 남겼다.
- **NPC 결함**(2026-09-26 점검): 말풍선 미표시, 렌더 경로 두 벌, 일과표 미연결, 화면 밖 culling, store 혼합. 가이드 작성 중 지각 설정 무시와 `openai` 기본 두뇌를 더 찾아 NPC-1로 계획했다.
- **무시되는 설정**: 가이드를 쓰며 소스와 대조하다 편집 UI·타입에는 있지만 아무 일도 하지 않는 설정, 엔진이 보내지 않는 규칙 트리거, 세 벌인 키 매핑을 찾았다. 흩어 고치지 않고 DEAD-1 하나로 모았다.
- **동적 GI**: Lumen을 wasm으로 돌릴 수는 없고(CPU), WebGPU compute로 Lumen의 소프트웨어 경로를 흉내 낼 수 있다. gw는 건축 격자를 복셀로 바로 쓸 수 있어 유리하다. GI-1로 계획했다([trends-2026.md](trends-2026.md)).

## 관련 문서

- [principles.md](principles.md) · [module-status.md](module-status.md) · [workflow.md](workflow.md) · [trends-2026.md](trends-2026.md)
- [../../PRD.md](../../PRD.md)
