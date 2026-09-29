# [1.4.0](https://github.com/jigglypop/gaesup-world/compare/v1.3.2...v1.4.0) (2026-09-29)


### Features

* **camera:** 앞을 가린 물체를 카메라 앞으로 당기는 대신 반투명하게 하는 가림 처리 모드(collisionMode: 'fade')를 고를 수 있게 한다 ([43ea000](https://github.com/jigglypop/gaesup-world/commit/43ea000752f64689aea0655ab65e15e14034569e))
* **rendering:** 후처리 preset cinematic이 WebGPU에서 화면 공간 GI(SSGI)와 반사(SSR)를 더해, 색 번짐·간접광·금속과 광택 면의 반사를 그리고 GTAO를 대신한다 (GI-1) ([37fefdc](https://github.com/jigglypop/gaesup-world/commit/37fefdca2dc9399bd10d5bf7b5cc7852fc861886))

## [1.3.2](https://github.com/jigglypop/gaesup-world/compare/v1.3.1...v1.3.2) (2026-09-28)


### Bug Fixes

* **demo:** 설치형 소비자 데모가 모든 피어를 예제와 한 벌로 써, WebGL2 경로의 Canvas 훅 오류와 Pages 배포 검증 실패를 없앤다 ([81a5fba](https://github.com/jigglypop/gaesup-world/commit/81a5fbac669e3f87732e80e7fac50275df469cc2))

## [1.3.1](https://github.com/jigglypop/gaesup-world/compare/v1.3.0...v1.3.1) (2026-09-28)


### Performance Improvements

* **editor:** NPC 뇌 흐름 보기(React Flow)를 열 때만 받아, 편집기를 쓰지 않는 앱의 번들에서 뺀다 ([84a0463](https://github.com/jigglypop/gaesup-world/commit/84a0463c4c80d70a761bccf41ea32857dd290b85))

# [1.3.0](https://github.com/jigglypop/gaesup-world/compare/v1.2.0...v1.3.0) (2026-09-28)


### Bug Fixes

* **package:** 건축 카탈로그의 자연물 glTF를 npm 패키지에 넣는다 ([e57d52e](https://github.com/jigglypop/gaesup-world/commit/e57d52ec41dd3d1175ec4a3e8bc4d5926d03f937))


### Features

* **network:** RemotePlayers를 공개하고 원격 이름표를 DOM 이름표 층으로 그린다 ([7012ad4](https://github.com/jigglypop/gaesup-world/commit/7012ad416116aac319ea641faabdd65cca17ab9f))


### Performance Improvements

* 카메라 충돌이 큰 지오메트리를 삼각형 격자로 찾아 걷는 동안 메인 스레드를 7.7→6.0ms/프레임으로 줄이고, 꾸미기의 편집·모드 전환 long task를 없앤다 (PERF) ([73dded8](https://github.com/jigglypop/gaesup-world/commit/73dded8601ebb2833fdbd1fe61d596492c19ead0))
* **rendering:** 후처리(MRT)도 장면을 pass 대상으로 미리 컴파일해, 켜는 순간의 6초 멈춤과 1.2초 long task를 없애고 켠 채 첫 로드를 11→6.5초로 줄인다 (PERF-1) ([bb52a1c](https://github.com/jigglypop/gaesup-world/commit/bb52a1c2e3623870841fe07c33eac185e3f72510))

# [1.2.0](https://github.com/jigglypop/gaesup-world/compare/v1.1.0...v1.2.0) (2026-09-27)


### Bug Fixes

* **networks:** authority 라우터가 명령이 들어온 세션을 받아 세션 actor로만 행동하게 하고 verifyActor에도 세션을 넘긴다 (D-5) ([1f389a5](https://github.com/jigglypop/gaesup-world/commit/1f389a5c673b66a61874224c9a8ebc336a1e195b))
* **save:** autosave, 초기 로드, 도메인 직렬화, 에디터 autosave 실패를 reportError로 보내 production에서도 runtime.onError에 닿게 한다 (SE-7a) ([6bb00d2](https://github.com/jigglypop/gaesup-world/commit/6bb00d2c56a542705969e30300bdd12607afebbc))
* **save:** building·npc·camera도 저장본에 없으면 새 세션 상태가 된다 (SE-3g) ([9097adb](https://github.com/jigglypop/gaesup-world/commit/9097adb2e7003a2d2b9851bf04a202bb4a629408))
* **controller:** GaesupController가 타입에 있는 prop을 모두 넘기고 PhysicsEntity가 scale과 배열 rotation을 반영한다 (SE-8a) ([0b91e25](https://github.com/jigglypop/gaesup-world/commit/0b91e25521f65bbefb2abeba89e549155e861f0f))
* **save:** IndexedDB 열기 5초·요청 8초가 지나면 트랜잭션을 중단하고 실패로 끝내, 멈춘 저장소에서 저장이 영원히 기다리지 않는다 (CK-13) ([a9ce019](https://github.com/jigglypop/gaesup-world/commit/a9ce019c73d576775968d9ef451557116a21a67b))
* **motions:** MotionBridge의 move는 엔티티 설정으로 수평만 조종하고 jump는 jumpForce로 뛰며 turn은 yaw로 몸을 돌린다 (SE-8b) ([4be3579](https://github.com/jigglypop/gaesup-world/commit/4be3579c103dd5c64209aa40899fd53490a4861b))
* **npc:** NPC 자율 이동이 navigation grid의 경로로 벽을 돌아가고 닿을 수 없는 지점은 벽을 뚫지 않고 건너뛴다 (D-8) ([ba4d6ed](https://github.com/jigglypop/gaesup-world/commit/ba4d6ed3cef3d24a20d6a43390539bc4f3945ecb))
* **npc:** NPC가 플레이어를 보고 새로 들어온 대상을 알아채며, 바라보기·애니메이션·waypoint 도착이 실제 자세와 한 번의 store update로 처리된다 (N-8) ([f2b077d](https://github.com/jigglypop/gaesup-world/commit/f2b077d10cb24b36ee8cbf27678443675fe78a55))
* **motions:** PhysicsEntity의 바깥 ref가 rapier가 다시 만든 살아 있는 body를 따라가고 언마운트되면 비워진다 (D-2) ([61f9136](https://github.com/jigglypop/gaesup-world/commit/61f913616ff20cbc3f56055cb8c245330d2b5253))
* **network:** pong 없는 half-open 연결을 끊고 jitter 백오프로 재연결하며 짧은 끊김에는 원격 플레이어를 유지한다 (14-f) ([5d528e9](https://github.com/jigglypop/gaesup-world/commit/5d528e9898a106f5255d71423bc6bd1a4014613f))
* **visit:** relay가 인증한 발신자가 주어지면 visit 채널은 그 발신자 자신의 방 스냅샷과 퇴장만 받는다 (D-6) ([830d019](https://github.com/jigglypop/gaesup-world/commit/830d0198d120fb528382eaeb14433646510091ef))
* **motions:** useGltfAndSize의 gltf 공개 타입을 drei(three-stdlib) GLTF로 되돌려, 설치형 소비자의 타입 호환 검사를 다시 통과시킨다 ([fdd949e](https://github.com/jigglypop/gaesup-world/commit/fdd949ec4fb464c3aefe3384f363c52c31f87eaf))
* **water:** WebGPU에서는 WebGL 전용 반사 Water 대신 fallback 물을 그려 가까이 가도 매 프레임 오류가 나지 않는다 (D-1) ([d31843c](https://github.com/jigglypop/gaesup-world/commit/d31843c1670e47eda9c98641d6cec61ead0b45a4))
* **motions:** world의 첫 몸은 position prop 위치에서 시작하고, 이후 바뀌어 들어오는 몸만 마지막 활성 위치를 이어받는다 (D-3) ([247ec69](https://github.com/jigglypop/gaesup-world/commit/247ec692b23b3c52697c004ea8194d001e4aab77))
* **editor:** 건설 패널이 닫힐 때 열기 전 편집 모드로 되돌려 플레이어와 입력을 돌려준다 (SE-5a) ([7af3c66](https://github.com/jigglypop/gaesup-world/commit/7af3c661e2322112a706d11c13e2831a5d935e35))
* **building:** 공간 인덱스를 store와 함께 원자적으로 바꾸고 그룹 단위 편집도 인덱싱한다 (SE-4d) ([e5a1e5d](https://github.com/jigglypop/gaesup-world/commit/e5a1e5dabe3230d652fe98dee769a164eba89360))
* **gameplay:** 규칙 엔진 해시 구분자의 날 제어 문자(NUL, SOH)를 이스케이프로 바꿔 git·grep이 소스를 바이너리로 보지 않게 한다 ([8697231](https://github.com/jigglypop/gaesup-world/commit/86972312321ea40279841fab7d5f94246a4e4d55))
* **networks:** 그룹 메시지가 그룹 훅에 닿고, 메시지 훅이 수신하며, createGroup이 이름과 멤버를 지키고, HttpAssetSource 기본 fetch가 브라우저에서 동작한다 (SE-8c) ([80dcf2a](https://github.com/jigglypop/gaesup-world/commit/80dcf2a8cb9840f3d5bb8fa082cd50a752c2f188))
* **editor:** 기즈모 변환의 -0을 지워 회전 결과가 updateObject를 통과한다 (SE-3e) ([1402a53](https://github.com/jigglypop/gaesup-world/commit/1402a537add1f03457b3995945d6e3a59e9fd020))
* **minihome:** 대기 루프를 멈추고 편집 비용을 줄이며 probe가 찾은 제품 결함을 고친다 (DOM-11a) ([6675e55](https://github.com/jigglypop/gaesup-world/commit/6675e55f05b848886a3b449d045b1ddf1a5183c3))
* **npc:** 말하기를 NPCSimulation의 일시 상태로 옮겨, 매 결정마다 말해도 NPC 이벤트와 세이브가 늘지 않고 duration이 지나면 사라진다 (N-3) ([fd6f32c](https://github.com/jigglypop/gaesup-world/commit/fd6f32c1370e86d5beb826ff834dc995debb97dd))
* **visit:** 방문 스냅샷의 atomic 적용이 중간 실패를 역순으로 되돌리고 실패를 구조화해 알린다 (ISO-2) ([472632f](https://github.com/jigglypop/gaesup-world/commit/472632f88ebbe2477a5303dae9cb4123ede20b75))
* **npc:** 배회 목표를 NPC마다 다르게 home 주변으로 잡고, 같은 간격의 NPC 결정을 tick마다 흩어 함께 움직이지 않는다 (N-2) ([05b72de](https://github.com/jigglypop/gaesup-world/commit/05b72debca7e5c2bf696bd57c16b1f1120c232f5))
* **building:** 벽 collider를 종류별 조각으로 만들어 문·아치로 지나갈 수 있게 한다 (SE-4b) ([fd849c0](https://github.com/jigglypop/gaesup-world/commit/fd849c0d67a883c78d89b77eaa26b3c97362db89))
* **building:** 벽·블록·타일 box 하나를 렌더·collider·내비·가시성이 공유한다 (SE-4a) ([982824f](https://github.com/jigglypop/gaesup-world/commit/982824f06789d799e4a3834c37e3fb32ca65bc0b))
* **perf:** 성능 수집기가 프레임 렌더 뒤에 renderer 카운터를 읽어 WebGPU에서 draw·삼각형이 0으로 나오지 않는다 (SE-7c) ([5b4181e](https://github.com/jigglypop/gaesup-world/commit/5b4181e4f6f61399622cae0d07bdf4fbe8881d97))
* **test:** 셀 인덱스 테스트의 크기 인자를 number로 선언해 typecheck가 다시 통과한다 ([c7fa930](https://github.com/jigglypop/gaesup-world/commit/c7fa930dfe24577ac44a56cdf6270df77d413cec))
* **inventory:** 스택 용량 판정을 canAdd 하나로 모으고 아이템 정의를 등록 때 검증한다 (SE-3c) ([692b064](https://github.com/jigglypop/gaesup-world/commit/692b064bc15bea883975055fb92b1a8840590641))
* **network:** 원격 transform에 상한과 쿼터니언 정규화를, authority 명령에 입력 스키마를 둔다 (SE-3f) ([f6aeb65](https://github.com/jigglypop/gaesup-world/commit/f6aeb65f8fd33e3d875ca2385932192358837b83))
* **network:** 원격 모델 URL을 URL 파서 하나로 판정한다 (SE-3d) ([1ed1b02](https://github.com/jigglypop/gaesup-world/commit/1ed1b022f1ac611342e2c4a2d7965ca464185f45))
* **plugins:** 이벤트 listener 하나의 예외가 emit한 plugin setup을 실패시키거나 뒤 listener를 막지 않고 reportError로 간다 (SE-7b) ([5dcba43](https://github.com/jigglypop/gaesup-world/commit/5dcba4342a92671b90665750e65955dddcf79568))
* **editor:** 이벤트 패널 실행은 엔진 preview로 조건만 확인해 월드의 실제 이벤트 목록, 상태, 보상을 건드리지 않는다 (D-7) ([9fe00ff](https://github.com/jigglypop/gaesup-world/commit/9fe00ff37853f4f08ee9555bf3c642438015caa3))
* **ground:** 잔디가 자라는 메시 위 긴 풀 타일 둘레에 서던 5cm 턱을 없애, 잔디밭을 가로지르던 회색 선을 지운다 (CK-5) ([5be0989](https://github.com/jigglypop/gaesup-world/commit/5be098901671ec8c9f14e6ac7c92a39bbe755958))
* **save:** 저장 도메인의 값 변경 API와 로드가 같은 검증을 쓴다 (SE-3a) ([414a615](https://github.com/jigglypop/gaesup-world/commit/414a6152108a1b55156d4222a49d6e0adb5c89cf))
* **world:** 저장 슬롯을 월드당 최신 10개만 남긴다 (D-08, 14-c) ([620a0fd](https://github.com/jigglypop/gaesup-world/commit/620a0fdec531501d1cda6594065643e66d4fab27))
* **save:** 저장본에 없는 도메인은 이전 슬롯 상태를 끌고 오지 않고 새 세션 상태가 된다 (SE-3b) ([508948f](https://github.com/jigglypop/gaesup-world/commit/508948f56527bcda63f08f70b855ded4cd310703))
* **runtime:** 절전 모드에서 R3F가 밀리초 시각을 초로 넘겨 애니메이션 믹서가 음수 시간에 멈추고 캐릭터가 T자로 굳던 문제를 고친다 ([97f02ac](https://github.com/jigglypop/gaesup-world/commit/97f02ac85a4bb982fe907ffd547a08c029074010))
* **npc:** 정책 서버를 설정하지 않으면 요청을 보내지 않고 실패하면 함께 백오프한다 (DOM-03a) ([73c37fd](https://github.com/jigglypop/gaesup-world/commit/73c37fd1ac6dcab240bb1074f4b23a02bd0d3ec7))
* **building:** 짝수 타일은 격자 꼭짓점에, 벽 edge는 한 이름으로, 반대 방향 벽 겹침을 잡는다 (SE-4c) ([b3de846](https://github.com/jigglypop/gaesup-world/commit/b3de846477a98397217397639ed18f094c1fbc70))
* **camera:** 카메라 충돌 탐사를 발이 아니라 몸 중심 높이에서 시작해, 잔디 요철이나 뒤쪽 단차에 막혀 카메라가 캐릭터 몸 안으로 무너지지 않는다 ([1320ce4](https://github.com/jigglypop/gaesup-world/commit/1320ce42de68a813b630362f3045e5271697c71d))
* **motions:** 캐릭터 기본 모델 회전 보정을 π에서 0으로 바꿔, 키보드로 움직이면 뒤돌아 걷던 모델이 가는 방향을 본다 ([6dcfd75](https://github.com/jigglypop/gaesup-world/commit/6dcfd7597eab3bd15f991500cecba90a7b8ff2f5))
* **interactions:** 클릭 이동 경로선을 WebGPU에서도 그려지는 바닥 리본으로 바꾸고, 예제에 클릭 이동을 켠다 ([217f1ee](https://github.com/jigglypop/gaesup-world/commit/217f1ee6c07e8b87c0ad7efa5584320a22d8a25e))
* **interactions:** 클릭 이동 표식이 캐릭터를 따라 어긋나지 않고 누른 자리에 서며, dragOrbit: 'all'이면 왼쪽 드래그로 카메라를 돌린다 ([a96cc2e](https://github.com/jigglypop/gaesup-world/commit/a96cc2e9a87c907a792494f152eed19309460d54))
* **audio:** 페이드를 예약할 수 없는 오디오 컨텍스트에서는 음악을 바로 멈춰, 언마운트 정리 중 예외를 던지지 않는다 (CK-13) ([de922e1](https://github.com/jigglypop/gaesup-world/commit/de922e12fa45fddbeb9b80242b619cb53e57e2cd))
* **motions:** 플레이어 위치 훅이 회전이 잠긴 body 대신 조작으로 돌린 facing을 돌려줘 도구와 부착물이 바라보는 쪽을 향한다 (D-4) ([65dbf9e](https://github.com/jigglypop/gaesup-world/commit/65dbf9e2e250675bd43eb5dde95527fc8eb4b045))
* **motions:** 플레이어가 없으면 플레이어 조회가 다른 엔티티로 넘어가지 않고 조종하는 몸만 motion 엔진을 쓴다 (SE-5c) ([558bef9](https://github.com/jigglypop/gaesup-world/commit/558bef95fd6d667fe66999320bcb9dc042ed1306))
* **rendering:** 후처리 MRT pass는 미리 컴파일하지 않아, 게이트 콘텐츠가 출력이 빠진 셰이더를 재사용해 pipeline 생성에 실패하지 않는다 (P-8c) ([d22f94c](https://github.com/jigglypop/gaesup-world/commit/d22f94c4a4b604997d8ee7ea3faa3f7ee1e3d0f9))


### Features

* **npc:** ally 캐릭터와 그 옷 파츠를 지우고, NPC 기본 템플릿을 압축한 trainer 두 명(각 1.7~1.8MB)으로 바꾼다 (N-1) ([7c8a599](https://github.com/jigglypop/gaesup-world/commit/7c8a599476ff6676401a1ba0f1e7026a6e7c9c8e))
* **npc:** NPC 기본 크기를 0.75배로 줄이고 몸 collider가 크기를 따라가게 한다 ([e4f7a7c](https://github.com/jigglypop/gaesup-world/commit/e4f7a7c9d6932f4aacba271c5cd79d00a17f14d7))
* **accept:** pnpm accept와 /accept로 운영 빌드에서 브라우저 수용 시나리오를 판정한다 (VER-03a, VER-04a, VER-05a) ([7fc0a1c](https://github.com/jigglypop/gaesup-world/commit/7fc0a1c937ccc150375228e6222a03952d00cb84))
* **perf:** quality="auto"가 GPU 시간을 재서 GPU 병목이면 해상도를 한 번에 맞춰 낮추고, CPU 병목이면 그림자 주기와 그리는 주민 수를 줄인다 (CK-10) ([1cb91b4](https://github.com/jigglypop/gaesup-world/commit/1cb91b49b601cc51f1b12b191c8aaca1129a94de))
* **perf:** useWorldLoadProgress가 파일 로딩과 셰이더 준비를 묶어 로딩 진행률을 주고, 예제는 섬이 조각조각 뜨는 동안 무대를 덮는다 (CK-13) ([d5a23d6](https://github.com/jigglypop/gaesup-world/commit/d5a23d6a7149f46ea9d253207e47c7f5ee41f76f))
* **building:** 같은 GLB 배치를 부위별 InstancedMesh 하나로 그리고, 매트 로우폴리 자연물 카탈로그로 예제 섬의 나무를 바꾼다 (CK-8 앞부분) ([ace0dba](https://github.com/jigglypop/gaesup-world/commit/ace0dba03b50bbe16a67cd3400d5a9d3bc966472))
* **rendering:** 내려가는 복제 모델을 해제하고, 모델을 바꾸는 동안 이전 모델을 유지하며, 장치를 잃으면 캔버스가 새 렌더러로 다시 올라온다 (CK-4) ([787ed63](https://github.com/jigglypop/gaesup-world/commit/787ed63302fe336b23e8da508d36743b20b171df))
* **ground:** 노드 렌더러의 타일 윗면이 텍스처를 월드 좌표로 읽고 잔디와 같은 섬 전체 색 흐름·20m 얼룩을 받으며, createTileSampler가 한 점의 타일·재질·높이·물을 상수 시간에 답한다 (CK-5) ([a86060a](https://github.com/jigglypop/gaesup-world/commit/a86060a1f09c458d8d499bc23c4c6186dbdf3a62))
* **ui:** 런타임 UI에 테마 변수를 두고, 예제를 Pretendard 서브셋과 글래스 미니홈피 디자인으로 다시 그린다 (CK-3) ([e55af15](https://github.com/jigglypop/gaesup-world/commit/e55af151de67bbcbf6eb040b61a04d43a18bb519))
* **building:** 메시가 자기 타일에 장식을 흩뿌리고(MeshConfig.scatter), 예제 길가에 꽃·돌·덤불이 무리 지어 난다 (CK-8) ([050b7de](https://github.com/jigglypop/gaesup-world/commit/050b7de81945e9b398ce70073a8fbbea39b7caa9))
* **grass:** 메시가 잔디밭 층을 키우고, 바람 잔디가 불규칙한 경계·군집·월드 예산·거리별 관절로 그려진다 (CK-6) ([b44a8e6](https://github.com/jigglypop/gaesup-world/commit/b44a8e6cd517e03016bd40d701a572199cd88c07))
* **ground:** 모래·눈밭이 열린 가장자리에서 바닥까지 내려앉고 이웃 잔디로 불규칙하게 번져, 해변과 잔디밭 사이의 곧은 경계와 회색 턱을 없앤다 (CK-5) ([d9dc5f7](https://github.com/jigglypop/gaesup-world/commit/d9dc5f732920031a796fd3ac565a0af65686cc4f))
* **water:** 물가 필드로 연못과 해안에 둑·젖은 모래·거품·수심을 그리고, 물이 안개·톤매핑을 받고 40/52m LOD로 단순해진다 (CK-7) ([f88eeac](https://github.com/jigglypop/gaesup-world/commit/f88eeac6d1997dbbd1c4462453c7b7226aed7b8d))
* **examples:** 미니홈피 틀, 주민 10명과 말 걸기, 상태 체크 패널을 공개 API로 만든다 (EX-1a 앞부분) ([6bf59ad](https://github.com/jigglypop/gaesup-world/commit/6bf59ad1b291a72960653d448a5e942246fcb4da))
* **core:** 선언만 있던 설정·트리거·입력을 살린다 — 안개·바다, 규칙 트리거와 영역, 방향키, 카메라 bounds (DEAD-1 앞부분) ([96cfed6](https://github.com/jigglypop/gaesup-world/commit/96cfed644b4a3c11d4e9969e7fa6a5219b6687c8))
* **networks:** 소켓에 64KB 넘게 밀려 있으면 위치 갱신을 보내지 않고 최신 값으로 합쳐 두었다가, 비워지면 한 번만 보낸다 (CK-13) ([52636df](https://github.com/jigglypop/gaesup-world/commit/52636dfba12038f7c1a8d8317d0e97cf269a7b6e))
* **rendering:** 수입 모델 재질을 정책으로 다듬고(생성 인물은 매트), 예제에 하늘 IBL과 ck의 햇빛 균형을 준다 (CK-2) ([bcff702](https://github.com/jigglypop/gaesup-world/commit/bcff70273f874888b86269bdd03948d353362413))
* **building:** 에디터 밖 GLB 모델을 정적 배칭처럼 32m 칸마다 한 메시로 합쳐, 모델 draw를 62에서 12로 줄인다 (CK-8) ([2e46855](https://github.com/jigglypop/gaesup-world/commit/2e46855c44d6fdf80331ea6ef621ccf2e99ddf02))
* **kernel:** 엔진 카운터 EngineStats와 runtime.stats를 둔다 (VER-01a) ([256603d](https://github.com/jigglypop/gaesup-world/commit/256603d38326c6c87aca8538e3d8399e00f75ced))
* **building:** 예제 꾸미기 탭이 실제로 편집을 켜고, 놓기·칠하기·지우기 도구로 소품·바닥·벽을 꾸민다 ([37dacb3](https://github.com/jigglypop/gaesup-world/commit/37dacb3d1f7ed934e4ee639c421248376c2cc815))
* **audio:** 음악을 바꾸면 1초에 걸쳐 교차 페이드하고, 반복 곡은 멈춘 자리에서 이어 틀며, 첫 입력에서 멈춘 오디오를 다시 켠다 (CK-13) ([f5ab055](https://github.com/jigglypop/gaesup-world/commit/f5ab05595f0f77e65f80db71bc9d569a878fa52c))
* **assets:** 인물 preset(optimize --preset figure)·인물 검사·Tripo 캐릭터 생성을 넣고, 트레이너 두 명의 MR 맵을 빼 GPU 텍스처를 각 5.6MB 줄인다 (CK-11) ([7740064](https://github.com/jigglypop/gaesup-world/commit/77400646725cee92a6bf9175af6cadfbe4305732))
* **perf:** 입력이 없으면 IdleFrameRate가 캔버스를 낮은 fps로 그리고, NPCSimulation이 내비게이션 교체·바라보기·다음 이벤트 시각을 제공한다 ([191699a](https://github.com/jigglypop/gaesup-world/commit/191699a2a363a72ea1583b9c976d32551edd5f95))
* **lighting:** 조명 구역(LightingZone)에 들어가면 해·반구광·환경광이 실내 쪽으로 섞이고, 발밑 원판 그림자(ContactShadows)가 캐릭터를 바닥에 붙인다 (CK-12) ([0e32c17](https://github.com/jigglypop/gaesup-world/commit/0e32c171cf8b8dc697d5d505994dff75acc5903c))
* **npc:** 주민이 길을 따라 걷고(왕복·지그재그·순찰), T자 없이 전환하고, 말 걸면 돌아보고 손을 흔든다 (CK-9) ([c07d717](https://github.com/jigglypop/gaesup-world/commit/c07d717f6abb76411c32720a62ce9bb7fdd81f56))
* **assets:** 코어의 모든 GLB를 공유 캐시 하나로 받아, 쓰는 동안 유지하고 최근 24개만 남기며, 동시 3개·30초 제한·실패 뒤 재시도로 불러온다 (CK-4) ([b0e68da](https://github.com/jigglypop/gaesup-world/commit/b0e68da42e09ce4529a75684e8949531158baf98))
* **ui:** 화면 좌표 이름표(Nameplates)가 주민 이름을 가까운 순 6개(터치 3개)까지, 서로 가리지 않게 머리 위에 띄운다 (CK-13) ([985e781](https://github.com/jigglypop/gaesup-world/commit/985e781111878f24275308ac431dbae6f484d749))
* **ground:** 흙길 덮개(objectType 'dirt')가 풀밭으로 부드럽게 번지고, 모래·눈밭이 월드 노이즈로 타일 경계 없이 이어진다 (CK-5) ([e5cd2de](https://github.com/jigglypop/gaesup-world/commit/e5cd2de19ed7671990f61db1f7bd4258bdcecaaf))


### Performance Improvements

* **save:** autosave는 revision이 움직인 도메인만 직렬화한다 (AST-06a) ([de54ff3](https://github.com/jigglypop/gaesup-world/commit/de54ff3518693b166dd9281cfc363ff78cd2bd63))
* **building:** box 타일과 solid 벽을 재질마다 월드 단위 배치 하나로 그린다 (12-f) ([9d2ac06](https://github.com/jigglypop/gaesup-world/commit/9d2ac065bbedefb6d37536bb60298b00622fd58b))
* **rendering:** GPU 배치를 capacity로 잡아 편집에 다시 만들지 않는다 (12-h) ([d17619a](https://github.com/jigglypop/gaesup-world/commit/d17619a8b9a82c8925914ba75f88fedaeaaa6b15))
* **editor:** hover가 BuildingPanel을 다시 그리지 않게 섹션별로 구독한다 (13-f) ([f7ba68e](https://github.com/jigglypop/gaesup-world/commit/f7ba68e5b532ca7c26e4dab55da22d7a8e10604b))
* **building:** hover가 배치 엔진을 다시 만들지 않게 데이터 identity로 memo한다 (13-a) ([e23fe04](https://github.com/jigglypop/gaesup-world/commit/e23fe0494d26f20e113aaf232957d49a4f477a2c))
* **frame:** mixer를 공유 animation 채널 하나로 갱신하고 인스턴스별 프레임 등록을 모은다 (11-g) ([8330cef](https://github.com/jigglypop/gaesup-world/commit/8330cefd9402bfb50c025f09ec5a7406b4ec39c5))
* **npc:** NPC 모델은 자기 Suspense와 CompileGate 안에서 로드·컴파일돼, 늦게 오는 모델이 위쪽 경계를 멈추거나 첫 프레임에 동기 컴파일하지 않는다 (P-8b) ([11a0484](https://github.com/jigglypop/gaesup-world/commit/11a048478882478951d41578ca025325d7b7191d))
* **npc:** NPC 목록은 id만, 각 NPC는 자기 인스턴스만 구독한다 (13-g) ([f1075b4](https://github.com/jigglypop/gaesup-world/commit/f1075b477492f046bc9377f5fdf6fcc712f08ac2))
* **examples:** PerformanceLab이 연 시나리오의 baseline JSON만 받는다 (10-e) ([8a0f387](https://github.com/jigglypop/gaesup-world/commit/8a0f387359e81abf822aed12e613015b179ae482))
* **scene-object:** SceneDocument 명령은 바뀐 객체와 부모 체인만 검증한다 (14-h) ([a4414b7](https://github.com/jigglypop/gaesup-world/commit/a4414b7b48aee635db1033be91177c9cecd078bc))
* **camera:** sweep 전에 삼각형을 로컬 bounds로 기각한다 (11-b 후속) ([f019d0a](https://github.com/jigglypop/gaesup-world/commit/f019d0a590caf2f9b993c0c3072d0f4835162653))
* **navigation:** wasm A*의 open set을 이진 힙으로 바꿔 닿을 수 없는 칸 클릭이 256×256 격자에서 287ms에서 8ms로 줄어든다 (P-1) ([5622527](https://github.com/jigglypop/gaesup-world/commit/5622527642c1763427cc30015887355d31a74693))
* **building:** WebGPU에서 사쿠라 꽃잎을 크기 있는 노드 스프라이트로 그리고, 나무를 더해도 재질과 pipeline을 그대로 써 S-B08이 0이 된다 (P-8d) ([45cbdc2](https://github.com/jigglypop/gaesup-world/commit/45cbdc275cb76fa6a81073e1632f92ccec30aa1c))
* **rendering:** 게이트가 그림자 cascade까지 실제 렌더 깊이로 미리 컴파일하고, 후처리는 장면을 자기 pass로 컴파일한 뒤 넘겨받아 새 오브젝트의 동기 컴파일이 사라진다 (P-8c) ([300d402](https://github.com/jigglypop/gaesup-world/commit/300d4020eb2919f93ec1cf08e607b81803e3d802))
* **rendering:** 게이트가 후처리 장면 pass의 target과 MRT로 사전 컴파일하고, 오브젝트 배치는 용량 여유로 추가 때 mesh와 셰이더를 다시 만들지 않는다 (P-8a) ([c70be3f](https://github.com/jigglypop/gaesup-world/commit/c70be3f8770b12aa554ec556da646591851039aa))
* **npc:** 결정 틱의 관찰·결정·행동을 store 갱신 한 번에 적용한다 (11-e) ([a7787b4](https://github.com/jigglypop/gaesup-world/commit/a7787b4a4e7fb82af1bdbd2ad094fc297925f015))
* **physics:** 고정 바디는 보간에 등록하지 않아 틱마다 Rapier에서 위치·회전을 읽지 않는다 (P-3) ([3f93b11](https://github.com/jigglypop/gaesup-world/commit/3f93b11bc974d3c9e4f5510e32040237c9a6b76b))
* **npc:** 관측·결정 기록을 NPCSimulation에 두고 행동이 있는 결정만 store에 써서, 아무것도 안 하는 NPC 30명이 1분 동안 store 알림 0, 세이브 revision 불변이 된다 (N-4) ([91c9809](https://github.com/jigglypop/gaesup-world/commit/91c9809fe668efcc84f2b1d3a38bf3ced81e80f3))
* **rendering:** 램프는 고정 조명 풀을 빌리고 새 객체는 비동기 컴파일 뒤 보인다 (12-l) ([bb5aaed](https://github.com/jigglypop/gaesup-world/commit/bb5aaedb1cde76bc6aae05298260accfde906b7a))
* **building:** 배치 검사를 BuildingSpatialIndex 점유 셀 조회로 한다 (13-d 잔여) ([014c1b4](https://github.com/jigglypop/gaesup-world/commit/014c1b478e97df5dc13757b3011c10066bb8b865))
* **save:** 변경 없는 autosave는 직렬화하지 않고 경계에서 한 번만 복제한다 (14-g) ([6f2d617](https://github.com/jigglypop/gaesup-world/commit/6f2d61766fc32f2e92450219c42893c37454916e))
* **building:** 상주 목록이 바뀌어도 객체 batch를 다시 만들지 않는다 (12-j) ([5b0b3dc](https://github.com/jigglypop/gaesup-world/commit/5b0b3dc39b33d666a7a0f5c0dcc9914195754b91))
* **navigation:** 에이전트 footprint별 통행 격자를 격자가 바뀔 때만 다시 만들어, NPC 배회 길이의 경로 쿼리가 13.6ms에서 0.15ms가 된다 (N-5) ([5801edc](https://github.com/jigglypop/gaesup-world/commit/5801edc81bfeba2249622c7e5a24448f0a0df0c0))
* **network:** 원격 아바타는 메시지마다 렌더하지 않고 공유 프레임 채널 하나로 보간한다 (14-e) ([ad313c6](https://github.com/jigglypop/gaesup-world/commit/ad313c6b1a534ed151e546172235d629032e2a97))
* **rendering:** 월드 전체를 CompileGate가 12ms 조각으로 나눠 컴파일한 뒤 보여, 첫 로드의 450~900ms 렌더 long task를 없앤다 (CK-4) ([0b29faa](https://github.com/jigglypop/gaesup-world/commit/0b29faa94dc4f1db68a18de2323b1e3fd580c2d6))
* **grass:** 이미 로드된 날 텍스처와 WASM이 있으면 새 잔디 chunk가 그것으로 시작해 타일 편집 한 번이 React commit 한 번으로 끝난다 (P-11) ([a02f9be](https://github.com/jigglypop/gaesup-world/commit/a02f9be40327524c10ff635ccee63d7e658fe1e6))
* **rendering:** 잔디 그림자는 가장 가까운 cascade에만 그리고 유리는 그림자를 드리우지 않아, 대기 프레임 그림자 draw가 89에서 58로 준다 (P-7) ([19f2227](https://github.com/jigglypop/gaesup-world/commit/19f22278ee5ebb01aaf977196bfe043b80edcc48))
* **network:** 정지 플레이어는 1Hz keepalive만 보내고 Update에서 identity를 뺀다 (14-d) ([cb3cef6](https://github.com/jigglypop/gaesup-world/commit/cb3cef694f4e11bab0508ac2895ec7cc7973ffc1))
* **building:** 지면류는 그림자를 받기만 하고 테두리 메시를 컬링한다 (12-m 일부) ([c621dc0](https://github.com/jigglypop/gaesup-world/commit/c621dc0beacf11555132cecabb11b1e20faa528c))
* **building:** 지형 옆면·계단·모래 가장자리가 격자 셀 인덱스로 이웃을 찾고 잔디는 바뀐 chunk만 다시 만든다 (P-9) ([7f67d73](https://github.com/jigglypop/gaesup-world/commit/7f67d73f1083e78442a81514ed793ad7d2f67ef5))
* **building:** 창문·문·난간 벽의 조각을 조각과 재질마다 InstancedMesh 하나로 그려 월드 프레임 draw가 약 2,000에서 147로 준다 (P-12) ([d0ee4b8](https://github.com/jigglypop/gaesup-world/commit/d0ee4b8ed3de60ebd3489dd54c180450047da781))
* **simulation:** 캔버스 프레임이 고정 시계를 진행하고 카메라는 보간 위치를 따른다 (11-f) ([7c51c12](https://github.com/jigglypop/gaesup-world/commit/7c51c127d897697b8ce1a325b09acda9ec210424))
* **examples:** 패키지 검사가 공개 entry를 re-export 모듈로 불러와 첫 화면(minihome)이 에디터·후처리·물리 청크 없이 gz 2.09MB에서 0.66MB로 뜬다 (P-6) ([183c21e](https://github.com/jigglypop/gaesup-world/commit/183c21e55533d357f3f28f07b7f62b851ab6a357))
* **building:** 편집 오버레이가 타일·벽·블록 수와 상관없이 draw 2번(인스턴스 하나, 선택 하나)으로 그려지고 클릭은 인스턴스로 항목을 고른다 (P-4) ([91a885d](https://github.com/jigglypop/gaesup-world/commit/91a885db77a48b2c1b497c074eb055c042ff15cd))
* **building:** 편집·선택·색 선택이 바뀐 그룹과 배치만 다시 그리고, 같은 색을 다시 고르면 mesh를 새로 만들지 않는다 (P-2) ([a50ad72](https://github.com/jigglypop/gaesup-world/commit/a50ad726b69a8ca465c69ef124a2b20e06749f54))
* **rendering:** 품질 등급 DPR이 캔버스 재렌더 뒤에도 유지되고 그림자가 세 축 모두 텍셀에 스냅한다 (REN-07a, REN-08a) ([2a3b318](https://github.com/jigglypop/gaesup-world/commit/2a3b3180220cbb68e111b18f7cbc7eec8e6bcaf7))
* **network:** 피어별 token bucket으로 Chat·Update 폭주를 막고 공개 asset selector를 쿼리별로 memo한다 (14-j) ([0d504b4](https://github.com/jigglypop/gaesup-world/commit/0d504b48152b523365db38c3b963a797524e503c))
* **rendering:** 해 그림자를 cascade마다 정한 주기로만 다시 그리고 작은 물체는 가까운 cascade에만 넣어, minihome 60Hz 렌더 CPU가 4.04ms에서 2.82ms로 준다 (CK-1) ([4222052](https://github.com/jigglypop/gaesup-world/commit/42220529345a0bf61d691b12a9c19093c1c29955))
* **npc:** 화면 밖 NPC의 애니메이션 mixer는 멈춰 있다가 화면에 들어오면 밀린 시간을 한 번에 따라잡는다 (P-10) ([c293c72](https://github.com/jigglypop/gaesup-world/commit/c293c726aa5d3cd1189fc82ffa96137f4b363492))

# [1.1.0](https://github.com/jigglypop/gaesup-world/compare/v1.0.32...v1.1.0) (2026-09-24)


### Bug Fixes

* **motions:** bodySettings가 Layer 1에서 Rapier 타입에 의존하지 않도록 구조 타입 사용 ([b23aa43](https://github.com/jigglypop/gaesup-world/commit/b23aa430af99f0b4210a17a446db021b5f92f656))
* **npc:** NPC 파츠 toon 재질 해제 누락 수정 (D-23) ([11615ab](https://github.com/jigglypop/gaesup-world/commit/11615abe6726c92684df963ddcb88e80e142b62b))
* PRD M0 결함 수정과 런타임 정리 ([446a54d](https://github.com/jigglypop/gaesup-world/commit/446a54d3c44c0d05e910e8209b5da8ca72fe6b20))
* **ci:** 데모 스타일 검사를 현재 minihome 셀렉터로 맞춘다 ([159ad37](https://github.com/jigglypop/gaesup-world/commit/159ad3730dd5d365908f55e64cb40690de35f2e8))
* **scene:** 자동 ID를 UUID로 바꿔 새로고침 후 충돌 제거 (D-22) ([58dc1fe](https://github.com/jigglypop/gaesup-world/commit/58dc1fec9dae57ae849d6b6bd5ebda96062618df))
* **camera:** 충돌 탐색을 발밑이 아닌 여유 높이에서 시작 ([b2e8c4b](https://github.com/jigglypop/gaesup-world/commit/b2e8c4bc65f21073265923e446e2241e9f5e376b))
* **dev:** 파일 쓰기가 끝난 뒤에만 dev 서버가 변경을 읽는다 ([95f2533](https://github.com/jigglypop/gaesup-world/commit/95f253384844846f4ee11b47c002f218818adcfc))


### Features

* **examples:** minihome 농장 구역과 Kenney farm 자산 ([d7faf54](https://github.com/jigglypop/gaesup-world/commit/d7faf543fa3de281d2667cbcddf2551d5cff5ce4))
* PRD 3차 작업 반영 ([f505c69](https://github.com/jigglypop/gaesup-world/commit/f505c69484f5d8c89b33b078e44f1c37ce24c747))
* **scene:** 객체 단위 SceneObjectDelta 계약 (30-a) ([b9fa210](https://github.com/jigglypop/gaesup-world/commit/b9fa2103cc3e63d40bb9026e14afc65016be8ee3))
* **errors:** 프레임·clock 경계 오류 보고 경로와 runtime onError (23-c) ([b8746c0](https://github.com/jigglypop/gaesup-world/commit/b8746c0e1224971771b1ca2620c035fc5dd47d5c))


### Performance Improvements

* **camera:** InstancedMesh 인스턴스 bounding sphere를 world 좌표로 캐시 ([578f984](https://github.com/jigglypop/gaesup-world/commit/578f984673d77bfc9e08b5a3917f19e0b32fa381))
* **npc:** NPC 목록 재렌더와 LOD 경계 재마운트 제거 (12-r, 13-b) ([3cac611](https://github.com/jigglypop/gaesup-world/commit/3cac611b46a5ff8f58c4e590ac005f0bd2cfdd45))
* **scene-object:** SceneRuntime world 행렬을 객체당 1회 계산해 공유 (30-b 일부) ([7fcfbc9](https://github.com/jigglypop/gaesup-world/commit/7fcfbc9c15a78dc4923a3335dd5dea1e826376de))
* **rendering:** TSL 재질 시간을 내장 time 노드로, 날씨 파라미터를 uniform으로 (12-s 일부) ([1871b51](https://github.com/jigglypop/gaesup-world/commit/1871b51349a4b7c920d43b0943ca69ce766d4fdc))
* **rendering:** WebGPU에서 섀도 depth 재질 순회 제거 (12-q) ([0ba1466](https://github.com/jigglypop/gaesup-world/commit/0ba146675534e1c84e6190d60da6600ebf2571d6))
* **building:** 가시성을 거리 상주로 바꿔 카메라 회전 중 그룹 재마운트 제거 (12-e, 12-i 일부) ([c7dadfe](https://github.com/jigglypop/gaesup-world/commit/c7dadfe49b478ec66fa9b50250aaf5a610753f51))
* **motions:** 값이 같으면 Rapier 바디 설정 호출 생략 (11-l 일부) ([585bb87](https://github.com/jigglypop/gaesup-world/commit/585bb879f6671e6b567d80b69d81547f94930618))
* **building:** 건물 collider를 장면 객체 없는 정적 collider로 만들고 평면 타일을 병합 (11-k) ([ed23352](https://github.com/jigglypop/gaesup-world/commit/ed233529accab6f5a634153edb8802780a639433))
* **time:** 게임 시간은 분이 바뀔 때만 store에 알린다 (11-c) ([0c22511](https://github.com/jigglypop/gaesup-world/commit/0c2251115c61e1686678a260e57dc9ad32b94e10))
* **harness:** 결정적 건설 데이터를 올린 R3F 월드 기준 장면 (10-a) ([000fba5](https://github.com/jigglypop/gaesup-world/commit/000fba5e2616ed85f282acdced114238873e7cc2))
* **building:** 렌더 스냅샷과 가시성 인덱스를 편집 단위로 증분 갱신 (13-e 일부) ([5083275](https://github.com/jigglypop/gaesup-world/commit/5083275f809ae9d515b8177ebf7c0f8bf7afc8c9))
* **simulation:** 물리 보간 present의 조상 체인 순회를 1회로 (11-h 일부) ([934b320](https://github.com/jigglypop/gaesup-world/commit/934b32058e8d590d88ba6e312a03969ce01da978))
* **building:** 배치 인덱스를 immer 밖 BuildingSpatialIndex로 분리 (13-d 일부) ([16d287b](https://github.com/jigglypop/gaesup-world/commit/16d287b3a181fb0e0c003da1e727fc48e5b8f9be))
* **state:** 불필요한 React 재렌더 제거 (13-c) ([b756110](https://github.com/jigglypop/gaesup-world/commit/b75611096421fb94111c94168bf8243ae5bd5112))
* **world:** 운영 환경에서 성능 수집기를 필요할 때만 마운트 (13-k) ([b1fd7b4](https://github.com/jigglypop/gaesup-world/commit/b1fd7b47022b8511f53d72e8c0028cf21a47c890))
* **camera:** 인스턴스별 충돌 broadphase를 bounding sphere 한 번의 변환으로 (11-b 후속) ([796e52a](https://github.com/jigglypop/gaesup-world/commit/796e52a25533a5d076264c97874c1ed86dad6506))
* **building:** 잔디 ground를 그룹당 한 번에 그리고 blade chunk를 8×8로 (12-f 후속) ([1bf4433](https://github.com/jigglypop/gaesup-world/commit/1bf4433f33f033b4bf6fde28aeb5f75a6b14115e))
* **building:** 잔디를 타일마다가 아닌 4×4 타일 chunk마다 한 번 그린다 (12-f 일부) ([a3da334](https://github.com/jigglypop/gaesup-world/commit/a3da33425a0392f654de02afea1c00d2779d0db4))
* **camera:** 충돌 후보를 캐시에서 받고 인스턴스·스킨 메시를 bounds로 거른다 (11-b) ([e2c57ca](https://github.com/jigglypop/gaesup-world/commit/e2c57ca80fcebed3b2091c311fb3302028442bbe))
* **camera:** 카메라 충돌 narrow phase 단일화 (11-j) ([384eec1](https://github.com/jigglypop/gaesup-world/commit/384eec19ae64acc31ab65adcd4e013271807c8cf))
* **motions:** 클릭 이동은 waypoint가 바뀔 때만 입력 store에 알린다 (11-d) ([0e93230](https://github.com/jigglypop/gaesup-world/commit/0e93230de4ec389ba42612284d0183744eef9dda))
* **harness:** 프레임 draw 합산, WebGPU 채널, 3회 중앙값 비교 (10-c) ([c43e389](https://github.com/jigglypop/gaesup-world/commit/c43e38940c3fc16ec2306c6720f046eef2f76b4c))

## [1.0.32](https://github.com/jigglypop/gaesup-world/compare/v1.0.31...v1.0.32) (2026-09-21)


### Bug Fixes

* **release:** initialize publication and reuse package credentials ([a0c8a3b](https://github.com/jigglypop/gaesup-world/commit/a0c8a3b5a7d7aa32117409c6807e4d0a044a17c0))
