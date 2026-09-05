# Save hydration preparation

## 목표와 범위

- 저장 순서 slice: 같은 SaveSystem의 같은 슬롯에 대한 save/remove를 요청 순서대로 실행한다. save는 호출 시점에 snapshot을 만들고, 실패한 저장/삭제는 호출자에게 오류를 전달하되 후속 작업을 막지 않는다. 다른 슬롯은 독립적으로 진행하고 완료한 큐는 해제한다. 서로 다른 SaveSystem/탭 사이 동기화와 read의 쓰기 대기는 범위 밖이다. 검증은 지연 adapter의 연속 저장, 저장·삭제 교차, 실패 후 재시도와 슬롯 독립성을 포함한다.

- 비동기 복원 소유권 slice: 같은 SaveSystem에서는 마지막에 시작한 load/hydrateBlob이 복원 권한을 갖는다. 늦은 이전 read 응답은 적용하지 않고 false를 반환한다. 새 요청의 실패·취소로 이전 요청을 되살리지 않는다. 이미 취소된 signal은 새 요청을 시작하지 않는다. domain commit rollback은 별도 미완료 범위다.

- 재진입 slice: 같은 SaveSystem의 동기 serialize/migrate/prepare/apply 동안 createBlob/save/hydrateBlob/load 재진입을 거부한다. 구독 콜백이 중간 상태를 저장하지 못하게 하고 finally에서 실행 소유권을 해제한다. 진단 listener 실패는 원래 도메인 오류 및 다른 listener 전달을 가리지 않는다. 직접 store mutation, 서로 다른 SaveSystem 및 적용 실패 후 rollback까지 보호하는 트랜잭션은 아니다.

- 장면 slice: scene version/current를 준비 단계에서 검증하고 기존 미등록 장면 no-op를 유지한다. 적용 시 전환 세대를 갱신해 이전 goTo 비동기 실행을 취소하고 fade를 닫는다. 장면 상태 소유자는 기존 scene store이며 전환 세대는 비영속 실행 상태다.

- 카메라 slice: 모드, 알려진 숫자/boolean 옵션, 벡터/Euler 및 중첩 숫자 설정 검증과 역직렬화를 준비 단계로 이동한다. 기존 setMode/setCameraOption 적용 경로와 부분 스냅샷을 유지한다. 두 setter 사이 구독 부수 효과와 전체 commit 원자성은 별도 후속 범위다.

- 캐릭터 slice: v1/v2 프로필 마이그레이션과 v3 캐릭터 컬렉션 복원을 준비 단계에 연결한다. 외형/색/장비 구조를 검증하고 기존 기본 필드 보충, 빈 v3 no-op, 활성 ID 누락 시 첫 프로필 선택을 유지한다. 기본 외형 mirror와 characters의 동일 참조는 적용 시 보존한다.

- NPC slice: Map 구성과 deep clone을 상태 적용 밖으로 옮기고 컬렉션/중복 ID/version/editMode 및 instance transform을 준비 단계에서 검증한다. legacy instance 배열, 부분 snapshot과 사용자 template 참조는 보존한다. brain/event 등 중첩 콘텐츠의 전체 schema 검증은 이 slice로 완료했다고 간주하지 않는다.

- 농사/마을 slice: plot/house/resident의 ID·좌표·크기·상태·시각을 준비 단계에서 검증하고 좌표/크기 배열 소유권을 분리한다. version 1과 사용자 정의 crop/NPC/resident 참조를 유지하며 준비 중 registry 존재 여부를 강제하지 않는다. decorationScore의 기존 비저장 동작은 이 slice에서 변경하지 않는다.

- 퀘스트 slice: version, ID 일치, 상태 값, 비음수 정수 목표 진행도와 선택적 시각을 준비 단계에서 검증한다. 등록되지 않은 사용자 퀘스트/목표 ID도 보존하고 진행도 record를 복제한다. 기존 hydrate는 같은 준비 경로를 사용하며 quests plugin이 SaveSystem에 연결한다.

- 우편 slice: version 1, 중복 없는 메시지 ID, 일자, 선택적 읽음/수령 상태, 아이템/통화 첨부물을 준비 단계에서 검증한다. 첨부물까지 복제하여 입력 참조를 분리하고 mail plugin이 prepareHydrate를 전달한다. 미등록 사용자 아이템 ID와 생략된 count/read/claimed는 유지한다. 전체 적용 오류 rollback은 아직 미완료다.

- 이벤트/친밀도 slice: event ID·시각 및 NPC별 점수/일일 획득/선물 이력을 검증 후 준비한다. 이벤트 tags는 복원 active ID와 등록된 정의에서 다시 구성한다. 사용자 콘텐츠 ID와 version 1 계약은 유지한다.

- 소리/언어 slice: 음량(0..1), 음소거 boolean 및 지원 locale을 준비 단계에서 검증한다. AudioEngine 접근은 적용 단계에만 남기고 번역 bundle은 보존한다. AudioEngine 적용 자체의 예외/rollback은 전체 commit 원자성 후속 범위다.

- 시간/날씨 slice: 시간 파생값 계산과 날씨 기록 검증을 prepareHydrate에서 수행한다. 준비 및 복원에서 newDay/newHour 이벤트를 발생시키지 않으며 기존 복원 후 재개 동작을 유지한다. 유효 version 1, null 날씨, 빈 history를 보존한다.

- 제작/수집 slice: 해금 레시피 ID 목록과 도감 entry를 검증 후 소유 Set/record로 준비한다. 미등록 ID는 사용자 콘텐츠 호환을 위해 보존한다. 유효 version 1과 빈 기록을 유지하고 손상된 기록은 준비 오류로 보고한다.

- 경제 slice: wallet/shop의 prepareHydrate를 경제 플러그인에 연결한다. 유한한 비음수 잔액/누적액/가격, 정수 재고/일자와 중복 없는 상품 ID를 검증한 뒤 소유 데이터를 적용한다. 기존 version 1, 빈 재고 및 초기 일자 -1을 유지한다.

- 인벤토리 slice: store.prepareHydrate에서 슬롯·개수·단축 슬롯 참조를 검증하고 소유 배열을 준비한다. 기존 hydrate는 같은 경로로 위임한다. 공통 StoreDomainPluginConfig에 선택적 prepareHydrate를 추가해 명시적으로 플러그인 바인딩에 전달한다. 기존 사용자 정의 hydrate를 자동으로 다른 준비 함수와 조합하지 않는다.

- 건축 slice: 기존 Immer를 이용해 hydrateBuildingState의 검증/좌표 변환/공간 인덱스를 격리된 상태에 준비한다. store.prepareHydrate가 적용 함수를 반환하고 기존 hydrate도 이를 사용한다. 적용은 건축 영속 필드와 파생 인덱스에 한정하며 편집 모드 등 비관련 상태는 보존한다. building plugin이 준비 함수를 Runtime에 전달한다. 입력 데이터는 복제하여 호출자 참조를 소유하지 않는다.

- SaveSystem의 즉시 도메인 적용을 준비 후 적용 경로로 이관한다. canonical coordinator는 SaveSystem, 장면 mutation은 기존 controller.dispatch를 유지한다.
- DomainBinding에 선택적 prepareHydrate(data): () => void를 추가한다. 준비 함수는 상태를 변경하지 않고 검증·변환 후 적용 함수를 반환한다. 기존 hydrate 호출과 바인딩은 호환 경로로 보존한다.
- 첫 slice는 scene-document 바인딩을 이관한다. 준비 실패 시 어떤 도메인도 적용하지 않는다. 기존 바인딩과 commit 단계의 실패를 되돌리는 원자성은 아직 보장하지 않는다.
- 전체 원자성 완료에는 나머지 바인딩의 준비/적용 분리와 부수 효과·구독 알림 경계 정리가 필요하다. serialize/hydrate를 이용한 추측성 rollback은 사용하지 않는다.

## 검증

- 2026-09-05 슬롯별 저장 순서: 수정 전 신규 5개 테스트 실패, 수정 후 save/remove 교차 순서·호출 시점 snapshot·실패 후 진행·다른 슬롯 독립성 검증 완료. save/runtime/publicApi/packageExports 129 tests, 기존 memory suite 88 tests, build TypeScript와 production ESLint 통과. 큐는 SaveSystem 내부 비영속 상태이며 완료 후 Map에서 제거한다. 기존 memory suite는 저장 큐의 메모리 사용량을 직접 측정하지 않는다. 전체 테스트·브라우저 검증은 미실행. 전체 commit 원자성은 미완료다.

- 2026-09-05 비동기 복원 소유권: 수정 전 5개 stale-read 검사가 실패했고 수정 후 이전 응답이 먼저/나중에 도착하는 순서, 직접 hydrate, 새 요청 실패/누락/취소, 사전 취소 no-op, 후속 재시도를 검증했다. save/runtime/publicApi/packageExports 7 suites / 124 tests, build TypeScript와 production ESLint 통과. 요청 세대는 SaveSystem 내부 비영속 상태이며 저장 형식·메서드 signature는 유지한다. 최신 요청에 밀린 load의 결과는 false다. 전체 commit 원자성은 여전히 미완료이므로 plan은 active로 유지한다.

- 재진입 후속: serialize/prepare/apply에서 중첩 createBlob/save/hydrateBlob/load 거부, storage read/write 0회, 후속 정상 저장과 실패 후 실행 소유권 해제를 확인했다. 진단 listener가 던져도 원래 AggregateError와 후속 진단이 유지된다. 관련 117 tests 및 전체 Jest 278 suites / 2548 tests 통과(기존 1 suite / 1 test skip), 타입 검사·production ESLint·build:types 통과. 전체 commit rollback은 미완료다.

- 장면 후속: 잘못된 current가 선행 mail 적용을 차단하는 Runtime 검증, 준비 중 전환 지속, 복원 시 fade-out/hold/fade-in의 이전 실행 취소, 같은 목적지로 시작한 새 전환의 소유권을 검증했다. scene/scene-object/runtime/save/publicApi/packageExports 187 tests 통과. 전체 commit 오류 원자성은 미완료다.

- 2026-09-05 통합 확인: 카메라 slice까지 전체 Jest 277 suites / 2536 tests 통과, 기존 1 suite / 1 test skip. 실행 시간 69.3초. 전체 통과는 적용 단계 원자성·브라우저/GPU 동작의 완료 근거가 아니다.

- 카메라 후속: 손상된 벡터/Euler/숫자/boolean/중첩 값이 모드와 선행 domain을 변경하지 않는지, 준비된 벡터 및 중첩 설정의 참조 소유권을 검증했다. camera/runtime/save/publicApi/packageExports 197 tests, build 타입·production ESLint·build:types 통과. scene legacy binding과 전체 commit 오류 원자성은 미완료다.

- 캐릭터 후속: 손상된 프로필의 무변경 거부, 준비 중 상태 동일성·색/장비 소유권·활성 mirror 참조, legacy v1/v2 및 v3 복원과 Runtime의 앞선 mail 적용 차단을 검증했다. character/runtime/save/publicApi/packageExports 171 tests, build 타입·production ESLint·build:types 통과. 기존 미지원 버전 무시 테스트는 명시적 오류 계약으로 변경했다. 전체 commit 오류 원자성은 미완료다.

- NPC 후속: 잘못된 컬렉션/version/editMode/중복 ID/instance 좌표가 앞선 wallet 적용을 차단하고, prepare 중 상태 동일성·깊은 참조 분리·legacy 배열 및 부분 snapshot 보존을 확인했다. npc/runtime/save/publicApi/packageExports 122 tests, build 타입·production ESLint 통과. 중첩 brain/event 전체 스키마와 전체 commit 오류 원자성은 미완료다.

- 농사/마을 후속: 잘못된 좌표·크기·상태·일자·stage와 중복 ID 거부, 준비/serialize의 배열 소유권, 사용자 crop/NPC 참조 및 decorationScore 보존, Runtime에서 어느 쪽의 준비 실패도 두 도메인 적용을 막는 통합 검증을 추가했다. farming/town/runtime/save/publicApi/packageExports 138 tests, build 타입·production ESLint 통과. 전체 적용 단계 원자성은 미완료다.

- 퀘스트 후속: 잘못된 version/상태/ID/시각/진행도의 무변경 거부, 준비 중 상태 동일성과 사용자 목표 record 소유권, 실제 Runtime에서 손상된 퀘스트가 정상 우편 적용을 차단하는 통합 검증을 추가했다. quests/runtime/save/publicApi/packageExports 136 tests, build 타입·production ESLint 통과. 전체 적용 단계 원자성은 미완료다.

- 우편 후속: 손상된 첨부물·중복 ID·잘못된 일자/boolean/version의 무변경 거부, 준비 중 상태 동일성과 첨부물 소유권, null no-op와 빈 우편함 복원, 실제 Runtime에서 잘못된 우편이 정상 wallet 적용을 차단하는 통합 검증을 추가했다. mail/runtime/save/publicApi/packageExports 124 tests, build 타입·production ESLint 통과. 전체 commit 오류 원자성은 여전히 미완료다.

- 이벤트/친밀도 후속: runtime에서 잘못된 gift count가 앞선 events 적용을 차단하는 검사, giftHistory 소유권, events 복원 시 stale tags 제거, 잘못된 시작 시각 거부를 확인했다. events/relations/runtime/publicApi/packageExports 72 tests, build 타입·production ESLint 통과. 나머지 도메인과 commit 오류 원자성은 미완료다.

- 소리/언어 후속: runtime 경유 잘못된 locale/volume 준비 실패 시 audio apply 미호출·상태 동일성, 적용 시 audio apply 1회와 번역 bundle 보존을 검증했다. audio/i18n/runtime/publicApi/packageExports 67 tests, build 타입·production ESLint 통과. 실제 AudioEngine 실패의 rollback은 미완료다.

- 시간/날씨 후속: 잘못된 날씨 강도의 runtime 복원이 정상 clock 적용까지 차단하는지, 준비 중 상태 동일성과 history 소유권, day/hour 이벤트 미발생을 검증했다. time/weather/runtime/publicApi/packageExports 66 tests, build 타입·production ESLint 통과. pausedAt은 검증하되 기존 복원 후 재개 정책을 유지한다.

- 제작/수집 후속: runtime/plugin을 통한 잘못된 version/recipe ID/catalog 형태/수량의 선행 domain 적용 차단, 준비 중 상태 동일성, 원본 변경 격리와 custom ID 보존을 검증했다. crafting/catalog/runtime/publicApi/packageExports 60 tests, build 타입·production ESLint 통과. 나머지 domain 및 commit 실패 원자성은 미완료다.

- 경제 후속: wallet/shop 준비 상태 불변·입력 소유권·잘못된 숫자/중복 상품 거부·runtime에서 손상된 shop이 정상 wallet 적용을 막는 통합 검사를 추가했다. economy/inventory/crafting/runtime/publicApi/packageExports 88 tests, build 타입·production ESLint 통과. 전체 도메인 복원 원자성은 미완료다.

- 인벤토리 후속: malformed slot/count/hotbar/equipped 값의 준비 실패, 준비 중 상태 불변과 슬롯 소유권, 빈 hotbar 선택 시 유한 인덱스 유지, 실제 Runtime/plugin 경유 선행 도메인 적용 차단을 검증했다. inventory/plugins/runtime/save/publicApi/packageExports 126 tests, build 타입·production ESLint 통과. 기존 유효 version 1 저장 및 빈 inventory round-trip 유지.

- 건축 준비 후속: Immer의 격리된 draft에서 기존 hydrateBuildingState를 실행하고 건축 데이터/파생 인덱스만 commit한다. nullish no-op, 입력 복제, 편집 모드 보존, 잘못된 공간 좌표의 전체 준비 실패 검증을 포함해 building/runtime/save/publicApi/packageExports 396 tests 통과(기존 1 skip). build 타입·production ESLint 통과. 다른 도메인 적용 실패와 전체 구독 알림 원자성은 여전히 미완료다.

- Runtime 통합 후속: createGaesupRuntime의 save 바인딩 정규화가 prepareHydrate를 누락하던 경로를 수정했다. 플러그인으로 등록한 실제 SceneDocument 바인딩과 앞선 option 바인딩을 조합해 준비 실패 시 mutation 0, 정상 문서 적용을 검증했다. runtime/save/scene-object 123 tests, build 타입·production ESLint 통과.

- save/scene-object 도메인, publicApi/packageExports 테스트 및 build 타입 검사, 변경 파일 ESLint, build:types.
- 뒤에 등록한 잘못된 장면 문서가 앞선 도메인을 변경하지 않는지 확인한다.
- 준비 시 상태 불변, 적용 시 canonical replace 및 마이그레이션 1회 실행을 확인한다.

## 완료 조건

- [x] 준비 실패 시 모든 domain 적용 차단
- [x] scene-document 준비/적용 분리 및 기존 호출 호환
- [x] 검증 통과와 HARNESS 기록: 128 tests, build 타입, production ESLint, build:types
- [ ] 나머지 바인딩 이관과 적용 오류·구독 부수 효과 경계를 포함한 전체 원자성 검증
