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
