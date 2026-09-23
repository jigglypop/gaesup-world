# PRD-15 카메라

| 항목 | 값 |
|---|---|
| 우선순위 | P1 (15-a는 P0) |
| 트랙 | Fast (15-a~c), Epoch (15-d Scene/Game 분리) |
| 선행 PRD | 00. 15-c는 11 |

## 1. 배경과 문제

| ID | 내용 | 근거 |
|---|---|---|
| B-01 | 충돌 메시 캐시가 한 번도 적중하지 않음. `scene._frameId`를 설정하는 코드가 없어 매 호출 `scene.traverse` + 새 배열 + 전체 메시 레이캐스트 | `camera/utils/camera.ts:45-48` |
| C-02 | 충돌 판정마다 `obstacles` 배열과 결과 객체 할당 | `camera.ts:158,165,185` |
| C-03 | 궤도 스무딩 중 매 프레임 `updateConfig` → `{...config}`, `cloneCameraSystemConfig`, 키별 `emit`, `getConfig()` 재복제 | `useCamera.ts:285`, `BaseCameraSystem.ts:31-47` |
| C-04 | 카메라가 물리 step 이전 위치를 따라감. `<Physics interpolate>`와 조합 시 1프레임 지연이나 지터 가능 (추정) | `useCamera.ts:264` |
| C-05 | 에디터 편집용 카메라와 런타임 게임 카메라의 구분이 없음 | todolist "Scene/Game camera split: Partial" |
| C-06 | 카메라 도메인 테스트 밀도 낮음 (소스 50 / 테스트 13) | 정적 측정 |

## 2. 목표 / 비목표

### 목표
1. 카메라 충돌 비용을 씬 크기와 무관하게 만든다.
2. 카메라 경로의 프레임당 할당 0.
3. 카메라가 렌더되는 캐릭터 위치(보간 후)를 정확히 따라간다.
4. Scene 카메라(에디터)와 Game 카메라(런타임)를 분리한다.

### 비목표
- 시네머신급 카메라 블렌딩 시스템. 기존 cinematic 기능은 유지.

## 3. 요구사항

| ID | 요구사항 |
|---|---|
| FR-1 | 카메라 충돌 대상은 `cameraCollider` 레이어(또는 태그)가 있는 메시로 한정한다. 대상 목록은 씬 변경 이벤트로만 갱신한다. |
| FR-2 | 대상 수가 많으면 BVH(`three-mesh-bvh` 등) 또는 Rapier 쿼리로 레이캐스트한다. 선택은 열린 질문. |
| FR-3 | 궤도 입력은 설정 객체를 바꾸지 않고 카메라 런타임 상태(yaw, pitch, distance)만 바꾼다. 설정 변경은 사용자 조작 시에만 발생한다. |
| FR-4 | 카메라 목표는 `postPhysics` 이후, 보간된 렌더 위치 기준으로 계산한다. |
| FR-5 | 에디터 모드에서는 Scene 카메라(자유 비행, 오빗, 포커스), Play 모드에서는 Game 카메라. 전환 시 각 상태 보존. |
| FR-6 | 에디터에서 Game 카메라 미리보기(PIP) |
| NFR-1 | 메시 5,000개 씬에서 카메라 충돌 처리 0.3ms 이하 |
| NFR-2 | 카메라 경로 프레임당 할당 0 |

## 4. 설계

- `CameraCollisionIndex`: 씬의 `cameraCollider` 대상 목록을 소유. 오브젝트 추가·삭제 시 dirty 표시, 다음 프레임에 재구성. 프레임 카운터 트릭 대신 명시적 invalidate.
- 레이캐스트 결과와 obstacles 버퍼는 인덱스가 소유하는 재사용 배열.
- 설정과 런타임 상태 분리:
  - `CameraConfig` (거리 한계, 감도, 충돌 여부): 드물게 변경, 복제 허용
  - `CameraRuntimeState` (현재 yaw, pitch, distance, 목표): 매 프레임 변경, 필드 in-place
- Scene/Game 분리: `editor/playMode.ts`의 모드 변경을 구독해 활성 카메라를 바꾼다. 에디터 카메라는 `editor` 도메인이 소유한다.

## 5. 단계별 작업

| Slice | 트랙 | 내용 | 완료 기준 |
|---|---|---|---|
| 15-a | Fast | B-01 수정: 씬 변경 이벤트(오브젝트 추가·삭제) 기반 invalidate + 대상 레이어 한정, obstacles 재사용. 시간 기반 캐시는 "나중에 추가된 장애물 즉시 감지" 계약(`CameraControllers.test.ts`)을 깨므로 쓰지 않는다 | 캐시 적중 테스트, 기존 즉시 감지 테스트 유지, NFR-1 벤치 |
| 15-b | Fast | C-03 설정/런타임 상태 분리 | 궤도 회전 중 `updateConfig` 호출 0 |
| 15-c | Fast (PRD-11 이후) | `camera` 단계 이동과 보간 위치 추종 | 캐릭터·카메라 오프셋 흔들림 측정 |
| 15-d | Epoch | Scene/Game 카메라 분리, PIP | 에디터 play/stop 테스트 |
| 15-e | Fast | 테스트 보강: 충돌, 모드 전환, 경계값 | 카메라 테스트 파일 수 증가 |

## 6. 공개 API 영향

- 추가: `cameraCollider` 레이어 상수, `invalidateCameraColliders()`, `CameraRuntimeState` 타입.
- 변경: `enableCollision` 기본 동작이 "레이어 지정 메시만"으로 바뀜. 기존처럼 전체 메시를 쓰려면 옵션 필요 → 호환을 위해 1.x에서는 레이어가 하나도 없으면 전체 메시 폴백.

## 7. 검증과 완료 기준

- camera 테스트, memory 테스트
- NFR-1 벤치, 브라우저에서 캐릭터 이동 중 카메라 지터 측정 기록

## 8. 열린 질문

1. 충돌 레이캐스트를 BVH로 할지 Rapier 쿼리로 할지. Rapier 쿼리는 물리 콜라이더가 있는 대상만 잡는다.

## 구현 현황 (2026-09-23, 3차)

| Slice | 상태 | 내용 |
|---|---|---|
| 15-a | 완료 | `camera/core/CameraCollisionIndex.ts`: 씬별 대상 목록을 소유하고 `childadded`/`childremoved` 이벤트로만 dirty 표시, 다음 질의에서 재구성. `CAMERA_COLLIDER_LAYER`(30)가 켜진 메시가 있으면 그것만, 없으면 전체 메시(1.x 호환). `invalidateCameraColliders()`로 레이어 변경 등 이벤트 없는 변경을 반영. 결과 객체·obstacles 배열·Obstacle 풀 재사용. 일반 메시는 행렬 원소 인라인 바운딩 구 선검사로 조상 순회와 레이캐스트를 건너뜀 |
| 15-b | 완료 | `CameraRuntimeState { orbitYaw, orbitPitch }`를 `CameraSystem`이 소유. `useCamera`는 매 프레임 `system.setOrbit()`만 호출하고 `updateConfig`(설정 복제, 키별 emit)를 부르지 않음. 컨트롤러는 runtime → config 순으로 궤도를 읽음 |
| 15-c ~ 15-e | 미착수 | 15-c는 PRD-11 `camera` 단계 이전 이후 |

측정 (NFR-1, jest jsdom, 박스 메시 5,000개, 각 메시가 그룹 1단계 아래, 길이 7.3 레이):

| 구현 | 호출당 |
|---|---|
| 이전 (`_frameId` 미설정으로 매 호출 `scene.traverse`) | 1.89ms |
| 인덱스 + `THREE.Sphere` 선검사 | 0.82ms |
| 인덱스 + 인라인 선검사 (채택) | 0.10ms |

인라인 선검사에서 구조 분해 할당과 가변 인자 `Math.max`를 쓰면 1.1ms로 느려졌다. 프레임 경로 수학은 지역 변수와 비교문으로 쓴다.

검증: camera 14 suites / 90 tests 통과, `tsc -p tsconfig.build.json` 0, 변경 파일 린트 0.

## 구현 현황 (2026-09-23, 4차)

| Slice | 상태 | 내용 |
|---|---|---|
| 15-c | 완료(측정, 코드 변경 없음) | 카메라는 PRD-11 이후 `camera` 단계(물리 step과 rapier 보간 적용 뒤)에서 돈다. 완료 기준인 캐릭터·카메라 간격 흔들림을 `/world` 걷기 3초로 측정했다(RTX 5060 Ti, headless). 60fps: 프레임간 간격 변화 평균 0.0037, p95 0.0169. 프레임 제한 해제(약 730fps, 물리 60Hz와 불일치): 평균 0.0013, p95 0.0030, 최대 0.0125. 카메라 목표를 rapier 보간 위치로 바꾼 실험은 평균 0.0010, p95 0.0031, 최대 0.0432로 개선이 없어 채택하지 않았다. 카메라 위치 스무딩이 60Hz 물리 계단을 흡수한다 |
| 15-e | 부분 | `camera/utils/__tests__/camera.test.ts`: 스무딩 값 경계(누락, NaN, 0 이하, 1 이상), 프레임률 독립 보간(1프레임 비율 = 스무딩 값, 1×2프레임 = 2×1프레임), 높이 경계 0, 길이 0 충돌 검사. 결함 수정: `clampPosition`이 `minY || -Infinity`로 경계 0을 무시했다(`??`로 수정, 현재 내부 호출처는 없음) |
| 열린 질문 | 결정 대기 | 카메라 옵션 `bounds`(기본 minY 2, maxY 50)는 스토어·플러그인에 있지만 어떤 컨트롤러도 적용하지 않는다. 적용하면 1인칭(눈높이 2 미만)과 높은 탑다운 카메라 동작이 바뀌므로 기본값 조정 여부와 함께 결정이 필요하다 |
