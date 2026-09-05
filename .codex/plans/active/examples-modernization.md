# Examples modernization

## 목표와 범위

- 예제 전체의 사용자 문구를 한국어 중심으로 정리하고, 기본 메뉴는 월드·제작·멀티플레이·에셋·성능 시나리오로 유지한다. 개발자 기능은 별도 카탈로그에서 접근한다.
- 메뉴와 경로의 source of truth는 기존 `examples/config/exampleRoutes.ts`를 유지한다. 중복 메뉴를 줄이고 모바일·키보드 탐색을 검증한다. 기존 URL은 유지한다.
- 후속 독립 slice: 저장 및 재접속 결함 수정, 프레임 경로·구독·리소스 수명 개선, 공식 릴리스와 호환성을 확인한 렌더러/의존성 현대화. 기존 typed-array 및 canonical scene command 경로는 보존한다.
- 기존 epoch 6a/8a의 완료를 가정하지 않으며 서로 다른 경계 변경을 한 번에 섞지 않는다.
- 리스크: 공용 라이브러리 UI의 영어 문구가 예제에 노출됨, 작은 화면의 메뉴/편집 도구 겹침, 렌더러 업그레이드의 GLSL 및 생태계 호환성.

### 저장 연결 slice

- 자동 저장/초기 로드의 source of truth는 호출자가 주입한 SaveSystem이며, 생략 시 기존 전역 SaveSystem을 유지한다. `useAutoSave`에 선택적 `saveSystem`, `useLoadOnMount`에 선택적 세 번째 인자를 추가하고 WorldSystems는 runtime.save를 전달한다.
- IndexedDB는 request 성공이 아닌 transaction 완료를 저장 완료로 취급하고 완료/중단 시 연결을 닫는다. save blob schema와 domain binding은 변경하지 않는다.
- 회귀 검증: 주입한 시스템만 저장·로드되는지, 타이머/이벤트 해제, transaction 완료 전 미완료 및 abort rejection, public API/package export 가드.

## 검증

- 변경 영역 테스트, 빌드 및 전체 타입 검사, 변경 파일 ESLint.
- 주요 제품 경로와 개발자 화면의 실제 브라우저 확인, 좁은 화면 및 키보드 탐색 확인.
- 성능 변경은 재현 가능한 시나리오와 전후 측정으로 확인한다.
- 공개 API·의존성 변경 시 publicApi/packageExports, package consumer 및 demo 검증.

## 완료 조건

- [ ] 예제 및 예제에서 사용하는 라이브러리 UI의 영어/혼합 문구를 조사하고 사용자 문구를 정리한다.
- [ ] 메뉴 중복·모바일 넘침·메뉴 닫힘·접근성을 수정하고 화면을 검증한다.
- [x] 저장·재접속 결함을 회귀 테스트와 함께 수정한다.
- [ ] 성능·구조 개선을 구현하고 최신 스택 호환성 및 실제 렌더링을 검증한다.
- [ ] 전체 목표에 맞는 검증 결과와 미해결 항목을 HARNESS.md에 기록한다.

## 2026-09-05 진행 기록

- 로그인 메뉴 후속: 긴 사용자 이름을 로컬 인증 fixture에 넣었을 때 844px 화면의 주요 메뉴 너비가 0px으로 축소되는 문제를 재현했다. 주요 메뉴의 shrink를 막고 사용자 이름을 최대 128px/축소 가능으로 제한하며 title로 전체 이름을 제공한다. 수정 후 로그인/비로그인 각각 320×568, 844×390, 1440×900에서 메뉴 전체 너비·로그아웃 가시성·기존 메뉴 동작 통과, pageerror 0. 임시 빌드 Chromium 종료0, build/root TypeScript·production ESLint 통과. LN7nhJ의 로그인 가로 화면을 직접 확인했고 비로그인 산출물은 afK6ZE다. 실제 서버 인증 검증이 아니라 별도 브라우저의 로컬 fixture를 사용한 레이아웃 검증이다.

- 메뉴 후속 브라우저 검증: probe-developer-navigation을 현재 소스의 임시 build/임의 포트 preview로 변경해 기존 개발 서버에 의존하지 않는다. Chromium 320×568, 844×390, 1440×900에서 그룹 3개·중복 링크 부재·카탈로그 호환 링크 2개 유지·마지막 링크 포커스·Escape 포커스 복귀·바깥 클릭·동일 경로 선택 닫힘·가로 넘침 없음 통과. 최종 직접 실행 종료0, pageerror 0. 산출물 TEMP/gaesup-navigation-dIicu3. 앞선 성공 실행 GRUHNj의 가로 화면과 p92geC의 모바일 화면을 직접 확인했다. 최초 검증의 잘못된 heading/둥근 모서리 클릭은 스크립트 오류로 수정했다. 전체 시나리오·로그인 상태·native GPU 검증은 별도 미완료다.

- 개발자 메뉴 중복 정리: /edit, /network는 각각 /creator, /multiplayer와 같은 화면을 쓰는 호환 주소이므로 주 메뉴의 개발자 목록에서 제외한다. 실제 Route와 전체 카탈로그는 유지한다. Navigation의 사용하지 않는 이전 로고·보조 메뉴 CSS 6개 규칙을 제거한다. 메뉴 그룹은 4개에서 3개로 줄이고 브라우저 probe의 기대값을 맞춘다. 수정 후 실제 브라우저 검증은 아직 미실행이다.

- 통합 검증 갱신: 현재 작업 트리에서 `corepack pnpm test -- --runInBand --silent` 종료0, 260 suites / 2305 tests 통과, 기존 1 suite / 1 test skipped. 예제 포함 `corepack pnpm exec tsc --noEmit` 통과. 공개 API·package exports·architecture boundaries·example consumption 검사도 이번 전체 실행에 포함됐다. 이는 실제 배포 패키지 재빌드/consumer 실행이나 모든 브라우저/GPU 동작 검증을 대체하지 않는다.
- 최근 추가 slice: RemotePlayer는 모델의 actions 변경 시 애니메이션 참조를 초기화하며 WXYZ 회전값을 최초 배치부터 그대로 적용한다. CharacterAssetPanel은 한국어 오류/로딩 안내와 중복 빈 상태 방지를 적용했다. FeatureAccessPanel은 캐릭터·탈것·이동을 native details로 접고 차량/비행기 위치 버튼 중복을 제거했다. assetStore는 최신 load 요청만 결과를 적용하고 reset 이전 요청의 결과를 무시한다. 기존 공개 API와 persistent schema는 유지하며 이전 HTTP 요청 자체를 취소하지 않는다. 메뉴 및 안내의 수정 후 브라우저 검증은 남아 있다.
- 저장 복원 미해결: SaveSystem의 도메인 hydrate 실패 시 부분 적용은 계속 남아 있다. 이전의 저장/재접속 완료 체크는 개별 수정 항목에 대한 기록이며 전체 복원의 원자성을 증명하지 않는다. 후속 slice는 기존 binding의 부작용/검증 경계를 조사하고 전체 검증 후 적용 계약을 마련해야 한다.

- 에셋 상세 후속 Chromium 검증: `scripts/probe-asset-catalog.cjs`가 기존 5173 서버와 새 브라우저를 사용해 390×844에서 실제 토끼 전사 옷 GLB 응답 성공, 종류 필터 후 선택 유지, 선택 해제와 canvas 제거를 확인했다. 로딩 완료 뒤 TEMP/gaesup-asset-catalog-TkWQrN/filtered-selection-mobile.png에서 실제 옷 모델 및 한국어 배치를 직접 확인했다. 새 브라우저의 메모리 store에 빈 목록/로딩 상태를 주입한 추가 실행에서 세 안내 상태도 확인했다(실제 서버의 빈 응답 검증과는 구분). 최종 스크립트 종료0, Node syntax 통과, pageerror0·가로 넘침 없음. 최종 산출물 TEMP/gaesup-asset-catalog-UJzxXD. 앱 코드·상태 소유권 변경 없음, 기존 서버 PID6980 유지. 전체 렌더러 및 전체 화면 검증은 여전히 미완료다.

- 에셋 목록의 종류 필터에 접근성 그룹 이름을 추가했다. 빈 목록은 로딩·종류별 결과 없음·전체 에셋 없음으로 나누어 한국어로 안내하며, 선택 상세에 선택 해제 버튼을 제공해 필터로 원래 항목이 숨겨져도 미리보기를 닫을 수 있다. 좁은 상세 영역은 줄바꿈을 허용한다. AssetCatalogPanel.tsx/styles.css 변경, 기존 useAssetStore의 필터·선택 상태 및 공개 API 유지. build/root 타입·변경 TSX ESLint·기존 examples recovery/assets 5 suites 17 tests 통과. 이 테스트들은 새 빈 상태와 상세 버튼의 직접 조작을 검증하지 않으며 해당 화면의 실제 브라우저 확인은 미완료다.

- 원격 캐릭터는 최초 애니메이션을 즉시 재생하고 전환 제한에 걸린 요청은 타이머로 실행한다. 새 상태와 unmount는 대기 타이머를 취소한다. PlayerPositionTracker는 속도만 바뀌어도 전송해 정지 정보 누락을 막는다. 신규 회귀 테스트 포함 networks 21 suites 298 tests, build 타입·변경 production ESLint 통과. test:memory 5 suites 88 tests는 boilerplate 수명 검사이며 원격 캐릭터의 실제 GPU 메모리 검증을 대신하지 않는다. 브라우저 멀티플레이 검증은 남아 있다.

- 에셋 lazy route의 실제 production build browser 검증 완료: `scripts/probe-lazy-assets.cjs`가 임시 Vite 빌드/preview와 새 Chromium을 사용한다. 390×844에서 홈 heading 표시 시 AssetsPage 청크 요청이 없고 메뉴 클릭 후 요청·에셋 heading 표시가 확인됐다. 뒤로/앞으로와 /assets 새로고침 통과, pageerror0 및 가로 넘침 없음. assets-mobile.png를 직접 열어 한국어 메뉴·종류 필터·목록 배치를 확인했다. TEMP/gaesup-lazy-assets-browser.log, 산출물 TEMP/gaesup-lazy-assets-8QboRw. 스크립트 종료0·Node syntax 통과. 에셋 선택 후 개별 모델 로딩이나 모든 화면의 접근성 검증까지 의미하지 않는다. 기존 개발 서버는 변경하지 않았다.

- 에셋 페이지를 App의 static import에서 lazy route로 옮겼다. 같은 demo build의 manifest static import closure 측정에서 초기 JS가 10 chunks / 2,457,237 bytes → 7 chunks / 515,746 bytes로 감소했다(비압축 파일 크기, 실제 전송량·FPS 수치 아님). 기존 URL과 로딩/오류 경계를 유지하며 에셋 방문 때 필요한 코드를 로드한다. demo verifier가 AssetsPage의 dynamic entry 및 초기 graph 제외를 검사한다. 전후 로그 TEMP/gaesup-assets-lazy-before.log 및 gaesup-assets-lazy-after.log. 실제 브라우저 첫 방문·route 전환은 후속 검증 대상이다.

- 월드 화면 이탈 시 WorldSystems의 AbortSignal을 loadWorldRuntime과 SaveSystem.load까지 전달한다. 읽기 대기 중 취소되면 hydrate, starter state와 world.ready를 실행하지 않고 초기 로드 캐시를 제거해 재진입 시 다시 읽는다. 완료된 초기 로드는 기존처럼 캐시하여 재진입 중 플레이 진행을 보존한다. 저장 상태의 source of truth와 공개 API는 동일하다. 저장 있음/없음의 취소·재시도 및 UI 수명에서 실제 신호 중단을 테스트한다. 저장 hydrate 자체의 도메인 간 원자성, 이미 시작된 gameplay dispatch의 중단과 실제 브라우저 지연 I/O 검증은 별도 미완료 항목이다.

- 관리자 로딩 경계: App에서 AdminTest의 eager import를 lazy로 변경하고 /admin/* 조합을 lazy AdminPage로 이동했다. Navigation의 인증 store 구독과 기존 경로/로그인 gate는 유지한다. demo manifest의 초기 static import closure를 순회해 두 route entry와 공유 GaesupAdmin JS가 포함되지 않는지 검증한다. 공유 관리자 UI 1,597 JS bytes가 별도 청크이며, 이전 정적/동적 admin-entry import 혼용 경고가 사라졌다. 이는 초기 네트워크 전송량 전체나 FPS 개선 수치가 아니다. 다른 shared vendor 및 packageSurface의 후속 로딩 비용은 남아 있다.

- 홈/에셋/카탈로그/경로 설명/카메라 도움말/제작 명령/일부 개발자 화면과 seed asset 이름을 한국어로 정리했다. JSX 정적 문구 외에 동적 라이브러리 패널의 문구와 장착 slot/tag 값은 추가 조사가 필요하다.
- 관리자 중복 메뉴 제거, 개발자 메뉴 이동/외부 클릭/Escape 닫기, 모바일 두 줄 탐색을 구현했다. 홈·에셋·카탈로그의 높이를 제한해 잘리던 본문이 실제로 스크롤되게 했다.
- 월드의 도구 패널은 기본 닫힘이며 열 때만 마운트한다. 성능 진단은 showDiagnostics에서만 제공한다. 모바일 미니맵과 알림의 내비게이션/단축 슬롯 겹침을 줄였다. 일부 도구 패널 내부 레이아웃과 모든 화면 크기의 검증은 남아 있다.
- CPU/GPU 성능 모드가 /performance 주소를 유지하며 query 기반으로 전환된다. React Router로 문서 재로드 없이 전환하고 GPU 수명 테스트를 유지했다.
- WebSocket error→close 자동 재접속, 같은 rigidBodyRef의 수동 재접속 후 위치 전송, IndexedDB transaction 완료/중단/close, 주입 SaveSystem의 자동 저장/로드를 수정하고 회귀 테스트를 추가했다.
- 빌드 및 root 타입 검사 통과. 저장/런타임/네트워크/API/HUD/경로 26 suites / 281 tests 통과. 전체 실행은 214 suites / 1940 tests 통과, 1 suite / 1 test skipped, 기존 성능 노출 정책 guard 1 failure였고 정책에 맞게 수정한 후 관련 3 suites / 34 tests 통과. 최종 전체 재실행과 package/demo 검증은 남아 있다.
- Playwright 실제 Chromium: 390px 홈/카탈로그 마지막 카드 스크롤, Escape와 경로 이동 메뉴 닫힘, /assets /multiplayer /creator /performance /world 로드 및 페이지 오류 없음 확인. CPU→GPU→CPU 전환과 문서 navigation entry 1개 유지 확인. 헤드리스 FPS는 하드웨어 성능 개선 근거로 사용하지 않는다.
- dev server는 이 작업에서 시작한 127.0.0.1:5173 (exec session 26709)이므로 후속 작업에서 재사용한다.

## 다음 렌더러 slice를 위한 확인 결과

2026-09-05 npm registry dist-tags와 공식 릴리스 확인: React 19.2.8, Three 0.185.1, R3F stable 9.7.0 / alpha 10.0.0-alpha.4, Drei stable 10.7.8 / alpha 11.0.0-alpha.6, Rapier 2.2.0, postprocessing 3.1.1, Vite 8.2.2, TypeScript 7.0.2. 아직 package.json과 lockfile은 변경하지 않았다.

- R3F 10 alpha 요구 three >=0.185, React >=19 <19.3. Drei 11 alpha 요구 R3F >=10.0.0-0. Rapier 2.2.0은 R3F ^9.0.4를 선언하므로 검증 없이 peer override를 추가하지 않는다.
- https://github.com/pmndrs/react-three-fiber/releases/tag/v10.0.0-alpha.4
- https://github.com/mrdoob/three.js/wiki/Migration-Guide
- 다음은 별도 epoch plan에서 renderer API/스케줄러/GLSL 경계를 정하고 기존 저장·UI slice와 분리해 업그레이드 및 실제 WebGPU/물리 검증을 진행한다. 전체 목표는 계속 active다.

## 남은 동적 표시 데이터 감사

### 월드 조명 로딩 경계

- World Canvas의 Lighting(Environment HDR 로딩), 날씨·후처리 효과가 기존 내부 Suspense 밖에 있었다. 이 요소들을 기존 월드 콘텐츠와 같은 내부 경계로 옮겨 3D 리소스 로딩이 상위 페이지를 숨기지 않게 했다. 월드 runtime 및 에디터 상태 소유권은 유지한다.
- 실제 WorldPage를 사용하고 Canvas DOM 어댑터·지연 Lighting으로 검사하는 회귀 테스트를 추가했다. 조명 promise가 대기 중이어도 overlay 버튼을 조작할 수 있고, 완료 후에도 편집 값이 유지되며 상위 페이지 fallback은 나오지 않는다. 실제 R3F/브라우저의 HDR 로딩 검증을 대신하지 않는다.
- build/root 타입 검사와 World.tsx ESLint 통과. 실제 브라우저의 느린 HDR 응답 시나리오는 후속 확인 대상이다.

### 편집 모달 키보드 접근성

- EditorLayout의 일반 section 오버레이를 showModal 기반 dialog로 변경했다. layout effect에서 열고 정리 시 닫아 화면 숨김/재표시 수명과 맞추며, 종료 후 기존 포커스 또는 선택 메뉴 버튼으로 복귀한다. Escape는 React의 패널 상태도 닫는다. Tab/Shift+Tab은 활성화된 표시 컨트롤을 순환하고, 자식이 이미 처리한 키 이벤트는 존중한다. 모달 keydown이 배경 단축키로 전파되지 않게 했다.
- 기존 모달 CSS 크기를 dialog 기본 스타일에 맞춰 명시했다. 모바일에서 흰색 기본 버튼으로 남아 있던 NPC 퀘스트 프리셋 추가도 기존 패널 버튼 스타일을 사용한다. 패널 ID, 등록/선택 상태 및 저장 계약은 유지한다.
- Chromium 1440x900: 전후진 20회 순환, 닫기 후 메뉴 포커스, NPC Escape 종료 통과. 후속 최종 구현에서 데스크톱/390x844의 첫↔마지막 컨트롤 경계 순환·닫기·Escape·포커스 복귀 및 pageerror 0 확인. 최신 모바일 캡처 TEMP/gaesup-modal-mobile.png 직접 확인. 초기 실패는 3D 초기 로딩 중 패널 표시가 사라지는 구간과 겹쳤으며 준비 상태 대기와 모달 수명 처리를 보완했다. 스크립트: scripts/probe-creator-labels.cjs [--compact].
- EditorLayout/GameplayEventPanel 3 suites / 18 tests, 빌드 타입 검사와 변경 production ESLint 통과. root 타입 및 demo 검사는 최초 dialog 구현에서 통과했으며 후속 focus 처리 이후 전체 suite/package는 재실행하지 않았다. 사용자 정의 패널의 모든 복합 위젯 키보드 동작까지 검증한 것은 아니다.

### 건축 편집 패널 중복 구현 정리

- sections.tsx와 placement.tsx/npc.tsx/objects.tsx를 TypeScript parser로 비교했다. 줄바꿈 정규화 후 타입·함수 선언 34개가 모두 동일했다(각각 13/9/12개). sections.tsx를 기존 모듈의 재내보내기로 변경해 이번 작업에서 중복 본문 약 1,100줄을 제거했다. 앞서 분리한 brain 재내보내기도 유지한다.
- 기존 sections import, 공개 심볼, 컴포넌트 props와 저장 상태 경로는 유지한다. 패널 구현은 각 분리 파일 한 곳에서 관리하며 코드 중복 감소를 FPS나 번들 크기 감소로 해석하지 않는다.
- editor/NPC 22 suites / 98 tests, build/root 타입 검사, 변경 파일 ESLint, test:demo 통과. demo에는 기존 500kB 초과 청크 경고가 남아 있다. 이번 구조 변경 후 실제 브라우저와 전체 Jest/package consumer 검증은 재실행하지 않았다.

### 기본 NPC·이벤트 문구 후속 정리

- NPC 기본 애니메이션·행동 그래프의 이름과 노드 label, 의상·캐릭터 설명 및 기본 게임 이벤트 4개의 이름·설명을 한국어로 변경했다. 기존 ID, trigger, action, graph 연결과 사용자 저장 데이터는 유지한다.
- ShopUI 기본 제목과 구매·판매 실패 사유를 한국어로 표시한다. store의 reason 값은 기존 계약을 유지하고 UI에서 변환한다.
- NPC/gameplay/economy 4 suites / 19 tests, 빌드 타입 검사 및 변경 파일 ESLint 통과. 실제 브라우저에서 해당 기본 그래프·이벤트·상점 오류 표시와 전체 타입/패키지 검증은 이번 변경에서 실행하지 않았다.
- 후속 Chromium 검증: /creator의 게임 이벤트 모달에서 기본 이벤트 4개 이름을 확인하고 모달 닫기→NPC 메뉴 전환을 검증했다. NPC 미선택 상태의 idle 표시를 없음으로 수정하고 실제 DOM에서도 확인했다. 선택된 NPC 상태는 기존 getNPCBrainLabel과 등록 애니메이션 이름으로 표시하며 사용자 이름은 보존한다. scripts/probe-creator-labels.cjs 통과, 페이지 오류 0. 기본 NPC 그래프 선택 및 상점 오류 화면, 모바일 레이아웃은 이 스크립트의 검증 범위가 아니다.
- BuildingPanel/NPC 4 suites / 17 tests, 빌드 타입 검사 및 변경 production ESLint 통과. 상태 소유권·공개 API·저장 형식 변경 없음.

### NPC 브레인 편집 중복 제거와 한글 표시

- sections.tsx의 NPC 브레인 구현과 brain/index.tsx의 구현을 줄바꿈 정규화 후 비교해 2,107줄이 정확히 같은 것을 확인했다. sections.tsx는 기존 심볼을 brain에서 재내보내며 brain/index.tsx가 단일 구현이다. 사용 중인 NPCPanel의 import와 동작은 유지하고 중복 본문·전용 import 2,123줄을 제거했다.
- 모드, 행동, 조건, 퀘스트 상태, 대상과 분기 기본 표시를 getNPCBrainLabel로 통일했다. 노드 제목·설명·미리보기·복제 기본 문구와 그래프 제어 접근성 이름도 한글로 표시한다. 사용자 label/대사 및 command, graph ID와 branch 값은 보존한다.
- 누락 분기 보완은 안내 문자열 startsWith 판정에서 실제 edges의 branch 판정으로 변경했다. 실제 inspector 버튼을 누르는 회귀 테스트에서 한글 경고 상태에서도 true/false 연결을 생성하며 원본 blueprint를 변경하지 않음을 확인했다.
- 에디터/NPC 20 suites / 85 tests 및 publicApi/packageExports 2 suites / 24 tests 통과. build/root TypeScript, 변경 production ESLint, diff check, test:demo 통과. 첫 타입 검사에서 이동 후 불필요해진 React import와 perception에 필요한 NPCBrainConfig import를 바로잡았다.
- 이번 slice는 실제 브라우저 NPC 조작, 전체 Jest 및 package consumer를 재실행하지 않았다. 대형 vendor chunk 및 admin 정적/동적 import 혼용 경고는 계속 남아 있다. 중복 소스 제거를 FPS/번들 감소의 증거로 사용하지 않는다.

### 프로젝트 패널·모바일 편집 메뉴 후속 검증

- ProjectAssetsPanel의 기본 분류, 검색, 종류, 상태, 카드 종류·장착 부위·기본 태그와 장면 오브젝트 수를 한국어로 표시한다. 식별자, 원본 metadata 및 사용자 이름/설명은 유지한다. 사용자 정의 renderer/label 계약도 유지한다.
- 에셋 종류 필터는 에셋 탭에만 적용한다. 장면·재질·프리팹으로 이동할 때 목록이 비던 결함을 수정하고 에셋으로 돌아오면 기존 필터를 복원하는 회귀 테스트를 추가했다.
- 표시만 tablist였던 버튼 그룹을 실제 동작에 맞는 group/aria-pressed로 표시하고 편집 패널 메뉴에 이름과 선택 상태를 제공한다.
- 예제 모바일 편집 메뉴는 한 줄 가로 스크롤과 압축된 실행/액션 행을 사용한다. 배경 투명도를 낮춰 밝은 월드 위의 글자 대비를 개선했다. 바닥 preset의 남은 영어 분류 10개도 한국어로 변경했다.
- Chromium /creator에서 1440x900과 390x844 화면을 직접 확인했다. 검색·종류 변경·장면 전환·필터 복원 및 가로 메뉴 마지막 스튜디오 버튼의 focus/viewport 진입을 확인했다. pageerror 0. 모바일 프로젝트 분류 y418→y367, 작업 영역 51px 확보. 메뉴 source of truth와 route는 변경하지 않았다.
- 스크린샷: 시스템 임시 폴더 gaesup-project-panel-desktop.png 및 gaesup-project-panel-mobile.png. 최초 desktop 로딩 화면은 검증 근거에서 제외하고, 실제 검색 결과와 편집 월드가 보이는 화면으로 다시 캡처했다.
- 프로젝트/바닥 2 suites / 27 tests, 편집 레이아웃·프로젝트·HUD 4 suites / 21 tests 통과. 첫 레이아웃 실행은 과거 영어 scenes 문구를 찾던 테스트가 실패해 한글 버튼 기준으로 수정한 뒤 통과했다. build/root 타입 검사, 변경 production ESLint, diff check 및 test:demo 통과. demo의 기존 대형 Three/physics chunk와 admin 정적·동적 import 혼용 경고는 남아 있다. 전체 Jest와 package consumer는 이번 slice에서 다시 실행하지 않았다.
- NPC brain preview 등 남은 표시 경로와 R3F 10/WebGPU 실제 실행은 미완료다. 전체 목표는 active다.

JSX 문구뿐 아니라 label/title/name/description 데이터도 추적한다. 식별자 및 사용자 입력은 번역 대상이 아니며 기본 표시 문구만 바꾼다.

- animation/components/AnimationController/index.tsx: 기본 애니메이션 이름.
- building/catalog/objects.ts, building/stores/buildingStore.ts, building/types/index.ts: 소품·벽·바닥·깃발 기본 이름과 설명.
- camera/components/{CameraController,CameraDebugPanel,CameraPresets}/defaults.ts: 카메라 모드·프리셋·설정 이름.
- character/components/ActionEquipmentPanel/defaults.ts: 장비 패널 기본 제목.
- editor/components/EditorLayout/index.tsx 및 panels/{BuildingPanel/helpers.ts,CameraSettingsTab/defaults.ts}: 메뉴 메타데이터·행동 프리셋·카메라 설정.
- plugin.ts의 브랜드 이름과 코드용 이벤트·타입 식별자는 표시 맥락을 확인한 후 판단한다.

## 멀티플레이어 연결·채팅 실패 처리

- PlayerNetworkManager에서 이전 소켓의 open/error/close가 새 연결 상태를 변경하지 않도록 현재 소켓을 확인한다. 대기 ACK 채팅의 send 실패를 큐에 보존하고, 기존 ACK 재전송을 대기 큐 flush보다 먼저 실행해 신규 메시지의 즉시 중복 전송을 막았다.
- 최초 직접 send 실패는 호출자에게 전달한다. 예제가 사용하는 PlayerInfoOverlay는 입력을 보존하고 한국어 오류를 표시하며 재시도 성공 뒤 안내와 입력을 지운다. 상태 소유권과 wire 형식은 유지한다.
- 네트워크 21 suites / 275 tests, build/root 타입 검사, 변경 production ESLint, diff check 통과. 기존 RemotePlayer 테스트의 react-test-renderer deprecation 경고가 출력된다. 실제 서버·브라우저 전송 실패 시나리오와 전체 Jest/package/demo는 이번 slice에서 실행하지 않았다.
- 검토에서 발견한 큰 건축 좌표의 무한 반복, 플랫폼 스냅샷의 불필요한 도메인 직렬화는 아직 수정하지 않았다. 메뉴·한국어 표시와 렌더러 현대화 전체 목표는 계속 active다.

## 기본 월드의 격자와 지도 표시

### 에셋 미리보기 skeleton 소유권

- 후속 썸네일 처리: 이미지 error 발생 시 실패 URL을 기억하고 기존 모델/재질 미리보기 경로로 전환한다. 다른 썸네일 URL은 정상적으로 새 로딩을 시도한다. 실패 URL 목록을 누적하지 않는다. 아래 과거 기록의 thumbnail 미처리 범위를 보완했다.
- thumbnail→모델→새 thumbnail 전환 테스트 포함 assets 14 tests, build/root 타입 검사·production ESLint·test:demo 통과. 기존 대형 청크 경고는 남아 있다. 테스트는 image error를 직접 발생시키며 실제 브라우저 네트워크 실패 검증은 아니다.

- 미리보기 Canvas 외부에 로컬 오류 경계를 추가했다. 모델 로딩 오류가 전체 목록을 교체하지 않고 해당 영역에 한국어 fallback을 표시한다. 에셋 종류·모델 경로가 바뀌면 오류 상태를 해제한다. 정상 상태에서는 자식을 강제 remount하지 않는다. thumbnail 이미지 로딩 실패는 이 경계의 대상이 아니다.
- loader 오류 후 형제 UI 유지와 다른 URL의 모델 복구를 컴포넌트 테스트로 확인했다. assets 13 tests, build/root 타입과 production ESLint 통과. 실제 브라우저/R3F 오류 전달과 fallback 표시 검증은 남아 있다.

- AssetPreviewCanvas의 일반 scene.clone을 기존 캐릭터 경로와 같은 SkeletonUtils.clone으로 바꿨다. 미리보기 skeleton/bone은 독립되고 useGLTF 원본의 geometry/material은 공유한다. effect 정리는 clone의 skeleton.dispose만 호출한다.
- 실제 Three SkinnedMesh/Skeleton/texture를 사용한 컴포넌트 테스트에서 뼈 참조 분리·원본 pose 보존 및 미리보기 bone texture 1회 해제를 확인했다. 원본 skeleton texture, geometry, material dispose는 호출되지 않는다. Canvas/GLTF loader는 mock이며 실제 GPU 누수 검증은 아니다.
- assets 4 suites / 12 tests, build/root 타입 검사와 production ESLint 통과. 기존 react-test-renderer deprecation 경고가 출력됐다. boilerplate 메모리 테스트 5 suites / 88 tests 통과. 실제 브라우저 스킨 모델 표시·선택 반복, package/demo와 전체 테스트는 이번 slice에서 실행하지 않았다.

### 프로젝트 검색과 한국어 표시 일치

- 후속 접근성 보완: 기본 목록의 button에 붙은 listitem role을 별도 목록 항목 컨테이너로 옮기고 button에는 aria-pressed를 제공했다. 선택 callback·controlled selectedItemId와 사용자 renderer를 유지한다. 목록 내 button 역할과 선택 상태 변경을 검사한 프로젝트 패널 14 tests, build 타입 및 production ESLint 통과. 실제 보조기술·브라우저 키보드 검증은 이번 변경에서 실행하지 않았다.

- ProjectAssetsPanel 필터가 표시용 종류·태그·장착 부위의 한국어 label도 검색한다. 기존 ID·이름·원본 종류와 태그 검색은 유지하고, 장면·프리팹 설명은 원문으로 검색한다. 표시와 검색이 같은 PROJECT_ASSET_DISPLAY_LABELS를 사용하며 원본 에셋 데이터는 바꾸지 않는다.
- UI 검색 입력으로 상의/의상/캐릭터 부품 및 top/cloth/ID/영문 이름을 검색하는 7건을 추가했다. 프로젝트 패널 13 tests, build/root 타입 검사와 변경 production ESLint 통과. 첫 테스트의 textbox role 오기를 실제 searchbox로 수정한 뒤 통과했다. 실제 브라우저 검색과 전체 suite/package/demo는 이번 slice에서 실행하지 않았다.

### 모바일 이벤트 카드와 편집 모달 실측

- 현재 5173 서버의 Chromium 390x844에서 긴 이벤트 ID가 마지막 카드의 편집·실행 버튼을 세로로 나누는 모습을 확인했다. 카드 본문을 minmax(0, 1fr), 액션을 auto 열로 배치하고 긴 본문은 줄바꿈하며 액션은 nowrap으로 유지했다. 저장 데이터와 이벤트 실행 동작은 변경하지 않았다.
- 변경 후 390x844 및 1440x900에서 게임 이벤트·NPC 모달 열기/닫기, Tab/Shift+Tab 경계 순환, Escape 및 메뉴 포커스 복귀 통과. 긴 ID 카드의 두 버튼 y 좌표 차이가 1px 미만임을 검증했다. pageerror 0. 모바일 변경 전·후와 최종 데스크톱 캡처를 직접 확인했다. TEMP/gaesup-modal-mobile.png, gaesup-modal-desktop.png 및 gaesup-creator-card-{mobile,desktop}.log.
- GameplayEventPanel 6 tests, build 타입 검사, probe 구문 검사와 diff check 통과. 이번 CSS 수정 뒤 전체 suite/package/demo는 재실행하지 않았다. 이 브라우저 검사는 편집 UI 범위이며 native GPU 성능이나 별도 SaveSystem 저장 동작 검증이 아니다.

### 스튜디오와 현재 월드 저장 시스템 연결

- StudioPanel은 useGaesupRuntime의 save를 우선 사용하고 provider가 없을 때 기존 getSaveSystem으로 돌아간다. 저장·불러오기·슬롯 목록·번들 생성·도메인 수 표시를 같은 인스턴스로 통일했다. 사용자 작업 callback과 기본 전역 저장 호환성은 유지한다.
- WorldPage에서 별도로 lazy 로딩되는 WorldEditorSurface에도 같은 runtime/revision provider를 전달한다. scene-document/store의 상태 소유권이나 저장 형식을 새로 정의하지 않는다.
- 별도 SaveSystem에 실제 저장·복원·번들 캡처하는 테스트와 편집 surface의 context 전달 테스트 추가. Studio/World loading/lifecycle 3 suites / 17 tests, build/root 타입 검사, 변경 production ESLint, test:demo 통과. 테스트 mock의 default export 및 import/order 실패를 수정한 뒤 통과했다. demo의 기존 대형 청크 경고는 남는다.
- 실제 브라우저의 별도 저장 시스템 시나리오와 전체 테스트는 이번 slice에서 실행하지 않았다.

### 예제 오류 화면 복구

- AppLayout이 pathname을 ExampleErrorBoundary의 resetKey로 전달한다. 오류가 발생한 상태에서 다른 경로로 이동하면 오류를 해제해 상단 메뉴로 정상 시나리오를 열 수 있다. 정상 상태에서는 자식 트리를 강제 remount하지 않는다.
- 기본 오류 설명은 한국어 복구 안내로 바꾸고 원본 오류는 접힌 개발자 상세에 보존한다. 긴 오류 문자열은 줄바꿈하도록 했다.
- 실제 App의 BrowserRouter/Routes와 오류 경계에 경량 페이지 mock을 연결한 복구 테스트 및 정상 자식 입력 보존 테스트를 추가했다. 브라우저 시각 검증과 전체 테스트는 아직 실행하지 않았다.

### 검토 후 저장·건축 반복 작업 보완

- 플랫폼 스냅샷은 월드·플레이어 허용 도메인만 직렬화한다. 전체 collectSaveDomains 계약과 포함 도메인의 실패 전파는 유지한다. 무관한 도메인의 serializer가 호출되지 않는지 실제 SaveSystem으로 확인했다.
- 건축 공간 인덱스·조회는 셀 크기, 정수 범위와 pair 키의 정밀도를 확인한다. 타일·블록 footprint와 공간 작업에 65,536셀 상한을 적용해 비정상 입력의 무한 반복·과도한 할당을 차단한다. 기존의 상한 초과 단일 작업은 이제 RangeError를 반환하며 총 월드 규모를 제한하지 않는다.
- platform/content 3 suites / 16 tests, building 29 suites / 281 tests(1 suite/test skipped), 후속 persistence/API 3 suites / 46 tests 통과. 후속 테스트에는 거부된 hydrate가 건축 store를 그대로 유지하는 2건이 포함된다. build/root 타입 검사와 변경 production ESLint 통과. 기존 THREE.Clock 등 테스트 의존성 경고가 출력됐다.
- 실제 브라우저 불러오기 오류 안내, raw hydration 원자성, 전체 payload 검증, 전체 Jest/package/demo 및 렌더러 현대화 검증은 남아 있다.

### 에셋 메뉴와 화면 밖 미리보기

- 후속 브라우저 검증: 기존 5173 서버의 실제 Chromium에서 scripts/probe-asset-previews.cjs 통과. 390x600 화면에서 옷 목록의 첫 항목·마지막 항목을 3회 왕복하며 가시 Canvas 생성과 반대쪽 비가시 Canvas 제거를 확인했다. 마지막 위치에는 Canvas 3개가 있었고 스크린샷에서 파란색·초록색·빨간색 옷이 표시되는 것을 직접 확인했다(TEMP/gaesup-asset-preview-scroll.png). 안경 메뉴 진입, 앨리 안경 장착 이름 표시, 비우기와 선택 상태 복귀도 통과했다. pageerror와 WebGL 컨텍스트 초과 경고는 0건. 실제 GPU 메모리·프레임 시간, 데스크톱 및 더 큰 에셋 목록의 스트레스 검증은 남아 있다.
- CharacterAssetPanel의 슬롯 목록을 OUTFIT_SLOT_LABEL에서 가져와 누락된 안경 메뉴를 복원했다. 장착 에셋은 ID 대신 이름을 표시하며 슬롯·에셋 선택 상태를 aria-pressed로 전달한다. 실제 스토어와 기본 안경 에셋을 사용한 장착·해제 테스트를 포함해 editor 21 suites / 97 tests 통과. 저장 형식과 장착 상태 소유권은 유지한다.
- AssetPreviewCanvas의 3D 분기는 IntersectionObserver로 보이는 항목만 Canvas를 마운트한다. 화면 밖으로 나가면 해제하고 재진입 시 복원한다. observer 미지원 환경은 기존 표시 경로를 유지하며 이미지 썸네일은 loading=lazy를 사용한다. 에러 경계는 스크롤에 따라 초기화하지 않는다.
- observer 모의 알림으로 최초 비가시 상태, 진입·이탈·재진입, observer 해제, 복제 skeleton texture 해제와 원본 skeleton 보존을 검증했다. assets 4 suites / 15 tests, memory 5 suites / 88 tests, build/root 타입 검사 및 production ESLint 통과. memory suite는 boilerplate 수명 검증이며 실제 GPU 메모리 측정은 아니다. 실제 브라우저 스크롤·빠른 재진입과 GPU/context 수 및 전체 demo/package 검증은 남아 있다.

### 미니맵 표시 범위 밖 타일 작업 감소

- MinimapSystem.renderTiles가 매번 tileGroups를 배열로 복사하던 작업을 없앴다. 원형 clip 영역과 교차하지 않는 타일은 Canvas 상태 저장·채우기·테두리 그리기 전에 제외한다. 가장자리 선/안티앨리어싱을 위한 1px 여유를 두며 회전은 원형 교차 여부를 바꾸지 않는다. 공간 인덱스·저장 상태·마커 동작은 변경하지 않았다.
- 같은 10,004개 타일 입력으로 HEAD와 현재 renderTiles를 TypeScript에서 추출해 실행한 결과 save/fillRect/strokeRect가 각각 10,004→3회였다. 실제 GPU/FPS 또는 전체 미니맵 처리 시간 측정은 아니다. 타일 순회는 여전히 O(n)이다.
- 0/45/90도 회전에서 가장자리 타일·큰 타일 유지, 원 밖 코너 타일 제외, 플레이어 이동 후 이전 원거리 타일 표시와 기존 미니맵 회귀 검증: 2 suites / 7 tests 통과. build 타입 검사 및 production ESLint 통과. 실제 브라우저 픽셀 비교와 전체 테스트는 이번 변경에서 실행하지 않았다.

- WorldPage의 플레이 화면에서 지면 Grid와 별도 BuildingSystem GridHelper를 모두 숨긴다. 진단 화면은 지면 격자, 제작 화면은 기존 건축 store의 격자 표시 설정을 따른다. 화면별 BuildingController/BuildingSystem.showGrid 선택 prop은 store 값을 덮어쓰지 않으며 생략 시 기존 동작을 유지한다.
- 기본 지면 재질을 회색에서 차분한 녹색으로 바꾸고 지도 방향을 동·서·남·북으로 표시한다. 지도 canvas와 확대·축소 버튼에 한글 접근성 이름을 추가했다. 밝은 하늘 위에서 월드 도구 버튼이 묻히지 않도록 어두운 배경을 적용했다.
- Chromium 390x844 및 1440x900에서 실제 WebGL draw를 기다려 격자 없는 월드와 한글 지도 표시를 확인했다. 초기 지도만 준비된 스크린샷은 3D 로딩 중이어서 결과로 사용하지 않았다. 페이지 오류 0. 시스템 임시 폴더 gaesup-world-ground-{mobile,desktop}.png에 캡처했다.
- build/root 타입 검사, 변경 production ESLint, UI/예제 4 suites / 14 tests, building/API/export 3 suites / 54 tests, build:types 통과. 새 격자 표시 override를 제거하면 store 설정이 복원되는 회귀 테스트를 추가했다. source of truth와 저장 형식은 변경하지 않았다. 전체 Jest/package/demo 및 native WebGPU 검증은 이번 slice에서 실행하지 않았다.
