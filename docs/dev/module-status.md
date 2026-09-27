# 모듈 상태

`src`의 모듈마다 지금 상태(유지·수정·통합·삭제 예정)와 알려진 결함, 복잡도 핫스팟을 정리한다. 수치는 2026-09-27 `main` 2fcfcece 기준이고, 줄 수는 테스트를 뺀 값이다. 모듈의 역할과 연결은 [architecture.md](architecture.md), 저장소 전체 지도는 [repository.md](repository.md)에 있다.

상태 표기: **유지**(코어, 큰 변경 계획 없음) · **수정**(유지하되 PRD slice가 있음) · **통합**(다른 구현과 한 벌로 합칠 예정) · **삭제 예정**(PRD에 삭제가 잡혀 있음).

## 모듈별 상태

| 모듈 | 줄 | 상태 | 메모 |
|---|---:|---|---|
| `core/building` | 17,603 | 수정 | 타일·벽·블록·오브젝트 데이터와 렌더링, 편집 입력. 편집 한 번에 보이는 그룹 전체를 재분류(PERF). GLSL·TSL 이중 경로(GPU-1). `BuildingController`가 `NPCSystem`까지 올리는 결합. 실행 취소·이동·복제·다중 선택 없음. |
| `core/editor` | 12,283 | 수정 | 에디터 셸과 패널. 루트 진입점이 통째로 재수출해 루트가 무겁다(LIB-1). `@xyflow/react`는 NPC 두뇌 그래프 패널에서만 쓴다. `PerformancePanel`이 자체 rAF로 따로 잰다. 기본 규칙 패널은 가장 가까운 월드의 엔진에 묶인다 |
| `core/motions` | 5,605 | 유지 | 물리 엔티티, 이동, 텔레포트. deprecated `AnimationController`·`useAnimationPlayer`(`hooks`)는 `useCharacterAnimator`로 옮긴 뒤 지운다 |
| `core/networks` | 4,504 | 수정 | 멀티플레이 WebSocket 클라이언트(`PlayerNetworkManager` 1,006줄 god file), 원격 플레이어, 방문 스냅샷. 서버가 저장소에 없다. `MultiplayerCanvas`가 WebGL 기본 렌더러로 그린다(GPU-1). transport 추상화(WebTransport)는 후보 |
| `core/camera` | 4,503 | 유지 | 카메라 7모드, 충돌(몸 중심에서 탐사, 2026-09-27 수정), 시네마틱. 디버그·프리셋 패널은 에디터용. `cameraOption`은 계산이 읽는 필드만 남겼다(DEAD-1) |
| `core/world` | 4,027 | 수정 | `GaesupWorld`(= `WorldConfigProvider`, 별칭 `World`), `GaesupWorldContent`, `WorldPhysics`, 탈것. 런타임을 만들지 않아 legacy store로 돈다(LIB-1). `World` 별칭은 삭제 후보. |
| `core/character` | 3,661 | 통합 | 캐릭터 도메인·메뉴·크리에이터. `OutfitAvatar`(원시 도형 오버레이)는 `AvatarRuntime`으로 합친다(UP-1) |
| `core/npc` | 3,440 | 수정 | 템플릿·인스턴스·두뇌·고정 틱 시뮬레이션·지각. 2026-09-26 점검 기준 결함: 말하기 상태는 있지만 말풍선으로 그리지 않는다. 렌더 경로가 두 벌(`fullModelUrl` 단일 모델과 부위 조립). 일과표가 시뮬레이션을 움직이지 않는다. 화면 밖 SkinnedMesh가 culling되지 않는다. store 하나에 카탈로그·인스턴스·에디터 선택이 섞였다. 지각이 `fieldOfView`·`hearingRadius`를 읽지 않는다. 두뇌를 정하지 않은 NPC에 `reinforcement`/`openai` 기본 두뇌를 붙인다(NPC-1) |
| `core/scene-object` | 3,430 | 유지 | 에디터 저작 모델(명령, 계층, 프리팹 오버라이드). 건축 store와 별개의 월드 모델이라 둘의 관계를 문서화해야 한다 |
| `core/interactions` | 3,424 | 유지 | 상호작용 대상, 자동화, 입력 브리지. `InteractionTracker`는 자동으로 올라가지 않아 월드에 직접 둬야 한다. `AutomationSystem`(593)과 `InteractionBridge`(591)가 크다 |
| `blueprints` | 3,332 | 유지 | 전사·마법사·카트 정의와 별도 ECS·에디터. 코어 소비자는 `useBlueprintEntity` 하나. 사용자가 삭제를 승인하지 않아 유지(2026-09-27) |
| `core/rendering` | 3,025 | 통합 | `createRenderer`, TSL 재질, `CompileGate`, `GpuBatchBridge`, 해·안개·후처리. WebGL 전용 `ColorGrade`·`LutOverlay`·`ToonOutlines`(GPU-1), 해 두 벌 → `SunLight`(UP-1). WebGPU 어댑터가 없으면 classic `WebGLRenderer`로 떨어진다(GPU-1). `CompileGate`는 MRT 후처리도 pass 대상·출력으로 미리 컴파일한다(three 내부 `_renderContexts`·`_nodes`에 기댐) |
| `core/animation` | 2,640 | 유지 | `AnimatorRuntime`(Unity식 상태 머신), 공유 애니메이션 |
| `core/ui` | 2,015 | 유지 | 토스트, 말풍선, 미니맵, UI 시스템 |
| `core/input` | 1,756 | 수정 | 입력 액션, 키보드·게임패드·터치. 조작 캐릭터의 키는 기본 입력 액션 표에서 파생한다(방향키·양쪽 Shift). 프로젝트 설정의 입력 바인딩은 아직 연결되지 않았다(LIB-1) |
| `core/runtime` | 1,489 | 수정 | 합성 루트. 객체 42개를 즉시 만들고 3개(`motions`, `motionBridge`, `animationBridge`)는 처음 접근할 때 만든다. suspend/resume 순서를 setup·deactivate·dispose 세 곳에 손으로 적는다. 자산 카탈로그·대화 레지스트리·오류 보고는 런타임마다 따로다(ISO-1, 수용 시나리오 S-H08) |
| `core/assets` | 1,427 | 유지 | 런타임별 자산 카탈로그(`createAssetStore`, 로드 세대 포함), GLTF 캐시·로더, 생산 파이프라인. GLTF 캐시는 페이지 전역이다 |
| `core/plugins` | 1,297 | 유지 | 레지스트리, 컨텍스트 레지스트리, 검증. `PluginRegistry.ts` 500줄. 런타임 `logger`를 주지 않으면 `ctx.logger` 출력이 사라진다(LIB-1) |
| `avatar` | 1,098 | 유지 | `AvatarRuntime`(공유 스켈레톤, 장착, LOD), `gaesup-world/avatar` |
| `core/navigation` | 1,061 | 수정 | 격자 길찾기(WASM A*). `NavigationSystem.ts` 743줄. 건축이 바뀌면 장애물을 전부 다시 적용(PERF) |
| `core/utils` | 1,007 | 유지 | 로거, 오류 보고, id, 벡터 |
| `core/scripting` | 946 | 유지 | 에디터 스크립트 컴포넌트 런타임 |
| `core/hooks` | 916 | 수정 | 컨트롤러·키보드·탈것·텔레포트 hook. deprecated `useAnimationPlayer` 남음 |
| `core/save` | 871 | 유지 | 도메인 바인딩 저장, 트랜잭션 복원, 어댑터 |
| `core/prefab` | 839 | 유지 | 프리팹 정의·인스턴스 |
| `core/gameplay` | 778 | 유지 | 트리거→조건→액션 규칙 엔진과 서버 권한 명령. 런타임이 상호작용·영역(`GameplayArea`, `createGameplayAreas`)·게임 시각 트리거를 보낸다 |
| `core/boilerplate` | 760 | 통합 후보 | `AbstractSystem`·`AbstractBridge`·`BridgeFactory` 계층. 여러 모듈이 쓰지만 추상화가 무겁다 |
| `core/scene` | 759 | 유지 | 장면 전환, 방 가시성 |
| `core/audio` | 720 | 유지 | WebAudio 합성 효과음·BGM |
| `core/project-settings` | 547 | 유지 | 입력·레이어 등 프로젝트 설정 |
| `core/stores` | 540 | 수정 | 월드 store(모드·URL·크기·성능 등) 슬라이스, `lazyScopedStore`. legacy 전역 store는 2.0에서 제거 예정 |
| `core/perf` | 520 | 수정 | 기기 감지·품질 tier·렌더러 통계·`IdleFrameRate`. GPU 시간과 성능 HUD가 없다(PERF). 잔디는 월드 profile이 아니라 전역 `usePerfStore`를 읽는다. `IdleFrameRate`는 게임패드 입력을 활동으로 세지 않는다 |
| `core/weather` | 454 | 유지 | 날씨 store·효과(TSL) |
| `core/time` | 443 | 유지 | 게임 시계·날짜 |
| `core/effects` | 415 | 유지 | 발자국, 텔레포트 효과 |
| `core/dialog` | 356 | 유지 | 대화 트리, `setFlag`·`custom` 효과, `flagEquals`·`custom` 조건(2026-09-27 일반화). 런타임마다 레지스트리를 갖고 legacy 경로만 `getDialogRegistry()`를 쓴다 |
| `core/simulation` | 344 | 유지 | 고정 스텝 시계, 물리 보간 |
| `core/content` | 334 | 유지 | 콘텐츠 번들 매니페스트 |
| `core/placement` | 322 | 유지 | 배치 규칙 엔진(건축 배치가 위에 얹힌다) |
| `core/platform` | 299 | 유지 | 월드·플레이어 스냅샷, 서버 플러그인 호스트 |
| `core/wasm` | 245 | 유지 | Rust 코어 로더(잔디, 눈, 가중 A*). 쓰이지 않는 Rust export가 여럿 있다 |
| `core/grid` | 210 | 유지 | 격자 좌표·스냅 어댑터 |
| `core/i18n` | 184 | 유지 | 언어 store |
| `core/error`, `kernel`, `types` | 198 | 유지 | 오류 경계, 엔진 통계, 공용 타입 |

## 복잡도 핫스팟 (가장 큰 파일)

| 파일 | 줄 | 문제 |
|---|---:|---|
| `core/networks/core/PlayerNetworkManager.ts` | 1,006 | 연결·재연결·핑·속도 제한·신뢰 전송·채팅 큐를 한 클래스에 담았다. transport와 프로토콜을 나눌 후보 |
| `core/building/components/mesh/sakura.tsx` | 852 | GLSL·TSL 두 경로와 변형이 한 파일. GPU-1로 GLSL을 지우면 줄어든다 |
| `core/building/components/mesh/fire/index.tsx` | 778 | 같은 이유(GPU-1) |
| `core/navigation/NavigationSystem.ts` | 743 | 격자 설정·WASM 연결·A* fallback·장애물 연결을 한 클래스에 담았다 |
| `core/building/types/index.ts` | 740 | 타입과 프리셋 데이터 표가 섞였다 |
| `core/editor/components/panels/BuildingPanel/index.tsx` | 645 | 벽·타일·블록·오브젝트·NPC 편집 패널 |
| `core/scene-object/commands.ts` | 631 | 명령 34개 |
| `core/building/components/mesh/grass/Grass.tsx` | 623 | 이중 경로와 LOD·컬링(GPU-1로 줄어든다) |
| `core/animation/core/animator/AnimatorRuntime.ts` | 609 | 애니메이터 상태 머신 |
| `core/interactions/core/AutomationSystem.ts` | 593 | 자동화 큐·통계·이벤트 |
| `core/interactions/bridge/InteractionBridge.ts` | 591 | 입력 브리지와 전역 싱글턴 |
| `core/building/model/placement.ts` | 586 | 건축 배치 규칙 |
| `core/editor/components/EditorLayout/index.tsx` | 571 | 에디터 셸 |
| `core/runtime/createGaesupRuntime.ts` | 513 | 합성 루트. 수명 목록 중복 |

품질 래칫 기준(`quality-baseline.json`)은 200줄 넘는 `.tsx` 39개, 500줄 넘는 `.ts` 10개를 허용한다. 늘리면 검증이 실패한다.

## 구조적 문제 요약

1. **기본 경로가 deprecated 경로다.** 런타임을 쓰는 코드가 라이브러리와 문서에 없어 `GaesupWorld`만 쓰는 소비자는 legacy 전역 store로 돈다(LIB-1).
2. **전역 상태가 남아 있다.** GLTF 캐시, 자동 저장 중지 카운터, legacy 싱글턴([architecture.md](architecture.md)의 "런타임 밖 전역 상태"). 자산 카탈로그·대화 레지스트리·오류 보고는 ISO-1에서 런타임 소유로 옮겼다.
3. **병렬 구현이 남아 있다.** 해 두 벌, 아바타 두 벌, 엔티티 모델 세 벌(`boilerplate`, `blueprints`, `scene-object`).
4. **렌더링이 두 벌이다.** GLSL과 TSL(GPU-1).
5. **번들이 쪼개지지 않는다.** 모듈 단위 트리셰이킹 불가(LIB-1).
6. **런타임이 거의 모든 것을 즉시 만든다.** 월드마다 객체 42개를 만들고, 생활 게임 도메인을 지우기 전에는 이 수가 더 컸다.
7. **글꼴이 실리지 않는다.** CSS가 `Pretendard` 이름만 쓰고 `@font-face`가 없어 설치되지 않은 기기에서는 시스템 글꼴로 그린다(EX-1).
8. **WebGL 기본 렌더러를 쓰는 컴포넌트.** `MultiplayerCanvas`는 `gl`을 넘기지 않아 `WebGLRenderer`로 그리고 drei `Grid`를 쓴다(GPU-1).

## 관련 문서

- [architecture.md](architecture.md) · [repository.md](repository.md) · [principles.md](principles.md) · [decisions.md](decisions.md)
- [../../PRD.md](../../PRD.md)
