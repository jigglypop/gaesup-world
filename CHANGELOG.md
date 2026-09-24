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
