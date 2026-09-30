# 캐릭터·카메라·입력

조작 캐릭터(`GaesupController`), 탈것, 카메라 7모드와 충돌, 키보드·게임패드·터치 입력, 클릭 이동, 상호작용, 텔레포트를 다룬다. 월드를 만드는 개발자와 이 문서를 진입점으로 쓰는 다음 작업 세션을 위한 문서이며, 모든 이름과 기본값은 현재 작업 트리의 소스에서 확인했다. 월드·런타임 기본 구성은 [getting-started.md](getting-started.md)와 [world-runtime.md](world-runtime.md)를 먼저 본다.

## 조작 캐릭터 `GaesupController`

`GaesupController`는 `ControllerWrapper`의 별칭이다(루트 `gaesup-world`에서만 export). 물리 몸체(Rapier 캡슐), 모델, 애니메이터, 키보드 입력을 한 번에 올린다.

```tsx
<GaesupWorld urls={{ characterUrl: '/gltf/trainer_green.glb' }} cameraOption={{ type: 'thirdPerson' }}>
  <Canvas gl={createRenderer}>
    <Suspense fallback={null}>
      <GaesupWorldContent>
        <WorldPhysics>
          <GaesupController position={[0, 2, 0]} clickToMove />
        </WorldPhysics>
      </GaesupWorldContent>
    </Suspense>
  </Canvas>
</GaesupWorld>
```

- `GaesupWorldContent` > `WorldPhysics` 안에 둔다. `WorldPhysics` 밖이면 Rapier 컨텍스트가 없어 오류가 난다.
- 모델 URL은 prop이 아니라 월드 store의 `urls`에서 온다. `mode.type`이 `character`이면 `urls.characterUrl`, `vehicle`이면 `urls.vehicleUrl`, `airplane`이면 `urls.airplaneUrl`을 쓰고, URL이 비어 있으면 아무것도 그리지 않는다.
- 건축 편집 모드(`editMode !== 'none'`)에서는 컨트롤러가 사라지고 키 입력이 풀린다. 편집을 끝내면 마지막 위치 위에서 다시 생긴다.
- 출처: `src/core/interactions/components/ControllerWrapper/index.tsx`, `src/core/motions/controller/EntityController.tsx`, `src/core/motions/entities/refs/PhysicsEntity.tsx`

### props

prop 타입은 `Omit<PhysicsEntityProps, 'url' | 'isActive' | 'componentType'> & { clickToMove?, enableKeyboard?, clickerOptions?, children? }`이다(`src/core/hooks/useGaesupController/types.ts`, `src/core/motions/entities/types.ts`). 공개 export 중 `ControllerWrapperProps` 타입은 이 prop 타입과 다른 옛 인터페이스이므로, 타입이 필요하면 `React.ComponentProps<typeof GaesupController>`를 쓴다.

| prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `position` | `Vector3 \| [x, y, z]` | 없음 | 시작 위치. 주면 월드의 첫 조작 몸체가 이 자리에서 시작한다 |
| `rotation` | `Euler \| [x, y, z]` | 0 | Y(yaw)만 쓴다. 몸체는 항상 서 있다 |
| `scale` | `Vector3 \| [x, y, z] \| number` | 1 | 그려지는 모델 배율. 자동 콜라이더도 따라 커진다 |
| `colliderSize` | `{ height, radius }` | 모델 크기에서 계산 | 캡슐 크기(월드 m). 주면 `scale`과 무관하다. 없으면 반지름 `max(0.18, min(폭, 깊이)×0.35)` |
| `parts` | `Part[]` | `[]` | 같은 스켈레톤을 쓰는 추가 GLB(`{ id?, slot?, url, color?, hideNodeNames?, attachment? }`). `attachment`가 있으면 뼈에 붙는 강체 부품 |
| `baseColor` | `string` | 없음 | 기본 모델 색. 캐릭터는 이름이 `body`·`skin`·`Body`·`Skin`인 노드만 칠한다 |
| `excludeBaseNodes` | `string[]` | 없음 | 숨길 기본 모델 노드 이름(부품과 겹칠 때) |
| `modelHierarchy` | `boolean` | `false` | 가져온 리그의 계층·재질을 그대로 둔다 |
| `modelYawOffset` | `number` | 0 | 모델 정면 보정. glTF 모델은 +Z가 정면이라 필요 없다. −Z를 보는 모델이면 `Math.PI` |
| (모델 교체) | | | `url`을 바꾸면 새 모델을 불러오는 동안 이전 모델이 그대로 보이고(`useDeferredValue`), 새 모델이 준비되면 바뀐다. 이전 모델의 복제본은 해제된다 |
| `animatorController` | `AnimatorControllerDefinition` | 기본 캐릭터 애니메이터 | 상태 머신. 기본은 클립 `idle`·`walk`·`run`(blend)·`jump`·`fall`·`ride`를 찾고 없는 클립은 건너뛴다 |
| `enableKeyboard` | `boolean` | `true` | 키보드 이동 입력 |
| `clickToMove` | `boolean` | `false` | 바닥 클릭 이동. 아래 [클릭 이동](#클릭-이동) |
| `clickerOptions` | `ClickerMoveOptions` | 아래 표 | 클릭 이동 길찾기 옵션 |
| `rigidBodyRef` | `RefObject<RapierRigidBody>` | 내부 ref | 몸체에 직접 닿아야 할 때(멀티플레이 위치 추적 등) 넘긴다 |
| `name`, `userData` | | | Rapier 몸체 이름·userData |
| `onCollisionEnter`, `onIntersectionEnter`, `onIntersectionExit` | Rapier payload 콜백 | | 충돌·센서 이벤트 |
| `onReady`, `onDestroy` | `() => void` | | 마운트·언마운트 |
| `onFrame`, `onAnimate` | `() => void` | | 엔진 프레임 스케줄러가 아니라 별도 `requestAnimationFrame`에서 돈다. 매 프레임 코드는 `useEngineFrame`을 쓴다 |
| `children` | `ReactNode` | | 캐릭터 모델 그룹 안에 붙는다 |

`groundRay`, `groundContactFilter`, `rigidBodyProps`, `rigidbodyType`, `sensor`, `isNotColliding`, `colliderChildren`, `animationCullRadius`도 통과되지만 저수준 설정이다. `isRiderOn`, `enableRiding`, `offset`, `ridingUrl`은 컨트롤러가 덮어쓴다.

### 이동 수치와 상태 읽기

이동 수치는 월드 store의 `physics`에 있다(`src/core/stores/slices/physics/slice.ts`).

```ts
const setPhysics = useGaesupStore((s) => s.setPhysics);
setPhysics({ walkSpeed: 6, runSpeed: 12, jumpSpeed: 12 });
```

| 필드 | 기본값 | 대상 |
|---|---|---|
| `walkSpeed` / `runSpeed` / `jumpSpeed` | 10 / 20 / 15 | 캐릭터 |
| `jumpGravityScale` / `normalGravityScale` | 2.4 / 1.0 | 캐릭터 |
| `airDamping` / `stopDamping` | 0.1 / 2.0 | 캐릭터 |
| `maxSpeed` / `accelRatio` / `brakeRatio` | 10 / 2 / 5 | 차량 |
| `gravityScale` / `angleDelta` / `maxAngle` | 0.3 / (0.02, 0.02, 0.02) / (π/6, π, π/6) | 비행기 |
| `linearDamping` | 0.9 | 공통 |
| `maxGroundSlopeAngle` / `groundContactTolerance` | π/4 / 0.03 | 접지 판정(설정하지 않으면 이 값) |

- `useStateSystem()`: `activeState`(`position`, `euler`, `velocity`, `isGround` 등)와 `gameStates`(`isMoving`, `isRunning`, `isJumping`, `canRide`, `isRiding` 등). 출처 `src/core/motions/hooks/useStateSystem.ts`
- `usePlayerPosition({ updateInterval?, reactive? })`: 플레이어 위치·속도·회전. `reactive: false`면 렌더 없이 벡터만 갱신한다. Canvas 안에서 쓴다.
- `useGaesupController()`: `{ state, mode, states, control, context, controller }`.

## 모델 URL과 조작 모드

`GaesupWorld`의 `urls`(`WorldAssetUrls`)와 `mode`가 월드 store에 들어간다(`src/core/world/components/WorldContainer/index.tsx`).

| 입력 | 반영 |
|---|---|
| `urls.characterUrl` / `vehicleUrl` / `airplaneUrl` | 그대로. 짧은 별칭 `character`·`vehicle`·`airplane`도 받는다(정식 이름이 우선) |
| `urls.ridingUrl` | 탈것에 탄 캐릭터 모델. `GaesupWorld`가 store에 넣는다 |
| `mode` | `{ type: 'character' \| 'vehicle' \| 'airplane', controller?: 'keyboard' \| 'clicker' \| 'gamepad', control?: CameraType }`. 기본은 `character` / `keyboard` / `thirdPerson` |

`mode.type`을 처음부터 `vehicle`이나 `airplane`으로 두면 그 모델을 직접 조종한다. `cameraOption`·`mode` 객체는 참조가 바뀔 때마다 store에 다시 적용된다. 부모가 다시 그려질 때마다 새 객체 리터럴을 넘기면 그때마다 카메라 설정이 초기화되고 휠 줌도 `zoom` 값으로 돌아가므로, 모듈 상수나 `useMemo`로 고정한다.

## 탈것 `Rideable`

`Rideable`은 탈 수 있는 차량·비행기를 센서 몸체로 올린다(`src/core/world/components/Rideable/index.tsx`, `src/core/hooks/useRideable/index.tsx`).

```tsx
<Rideable objectkey="kart-1" objectType="vehicle" url="/gltf/kart.glb"
  position={new THREE.Vector3(6, 0, 0)} displayName="카트" maxSpeed={18} />
```

- `objectType`은 `vehicle`과 `airplane`만 그린다(타입에 있는 `boat`, `bike`는 아무것도 그리지 않는다).
- 캐릭터가 센서에 닿으면 `gameStates.canRide`와 `nearbyRideable`이 켜지고, F를 누르면 탄다: `urls.vehicleUrl`(또는 `airplaneUrl`)과 `ridingUrl`(없으면 `characterUrl`)을 store에 넣고 `setMode({ type })`로 바꾼다. 다시 F를 누르면 내린다.
- 주요 props: `objectkey`(필수), `objectType`, `url`, `ridingUrl`, `position`, `rotation`, `scale`, `offset`(탑승자 위치), `maxSpeed`, `acceleration`, `rideMessage`, `exitMessage`, `displayName`, `enableRiding`, `onRide`, `onExit`, `controllerOptions`.
- 안내 UI는 DOM 컴포넌트 `<RideableUI states={gameStates} actionKey="F" />`를 Canvas 밖에 둔다(`gameStates`는 `useStateSystem()`에서). `exactOptionalPropertyTypes`를 켠 프로젝트에서는 `gameStates`를 그대로 넘기면 타입 오류가 나므로(`nearbyRideable`이 `undefined`일 수 있다) 필요한 필드만 골라 넘긴다.
- 차량·비행기 이동은 위 `physics` 표의 차량·비행기 값을 쓴다. 차량은 W/S 전후, A/D 조향, Space 제동이다.
- `ActiveObjects`·`PassiveObjects`·`PassiveVehicle`·`PassiveAirplane`·`PassiveCharacter`는 조종하지 않는 물체를 그리는 표시용 컴포넌트다.
- 이 경로는 단위 테스트(`PhysicsSystem`, `DirectionComponent`)만 있고 예제에서는 쓰지 않는다.

## 카메라

`GaesupWorldContent`가 `<Camera />`를 항상 올린다. 카메라는 `camera` 프레임 단계에서 월드 store의 `mode.control`과 `cameraOption`을 읽어 계산한다(`src/core/camera/hooks/useCamera.ts`).

### 모드 (`CameraType`)

| 값 | 위치 | 쓰는 거리 | zoom | 궤도 회전 | 모드 기본 충돌 |
|---|---|---|---|---|---|
| `thirdPerson` | 캐릭터 방향과 무관한 월드 기준 오프셋 `(-x, y, -z)` | x·y·z | 곱함 | 적용 | 켬 |
| `chase` | 캐릭터 뒤쪽. 오프셋 `(-x·sin yaw, y, -z·cos yaw)/√2` | x·y·z | 곱함 | 적용 | 켬 |
| `firstPerson` | 눈 높이 `y`, 정면으로 `z`만큼 앞, 캐릭터가 보는 쪽을 봄 | y·z | 안 씀 | 안 씀 | 끔 |
| `topDown` | 바로 위 `y` | y | 곱함 | 적용 | 끔 |
| `isometric` | 45° 방위, 수평 거리 `√(x²+z²)`, 높이 `y` | x·y·z | 안 씀 | 안 씀 | 끔 |
| `sideScroll` | 캐릭터 + `(x, y, z)` | x·y·z | 안 씀 | 안 씀 | 끔 |
| `fixed` | `(0, 10, 10)`에서 원점을 봄 | 없음 | 안 씀 | 안 씀 | 끔 |

출처: `src/core/camera/controllers/*.ts`. "모드 기본 충돌"은 컨트롤러의 `defaultConfig`인데, store의 `enableCollision`이 항상 채워져 있어 실제로는 적용되지 않는다. 1인칭·위에서 보기에서 충돌을 끄려면 `enableCollision: false`를 직접 준다.

### `GaesupWorld cameraOption` (`WorldCameraOption`)

| 필드 | 반영 |
|---|---|
| `type` (필수) | `setMode({ control: type })` |
| `distance` | 기본 15. `xDistance`·`zDistance`가 없을 때 둘 다 이 값(`topDown`은 0, `firstPerson`은 건드리지 않음) |
| `xDistance`, `yDistance`, `zDistance` | 그대로 |
| `height` | `yDistance`가 없을 때 `yDistance`(없으면 `topDown`은 `distance`, 나머지는 8) |
| `fov` | 목표 FOV |
| `zoom` | 거리 배율, 기본 1 |
| `enableZoom`, `minZoom`, `maxZoom`, `zoomSpeed` | 휠 줌(기본 켬, 0.45, 2.4, 0.001) |
| `enableCollision` | 카메라 충돌(기본 켬) |
| `collisionMode` | 가림 처리: `push`(기본, 카메라를 앞으로 당김) 또는 `fade`(가린 물체를 반투명하게). 아래 "가림 처리" |
| `collisionFadeOpacity` | `fade`에서 가린 물체가 닿는 불투명도, 0–1(기본 0.3, 물체 자신의 불투명도에 곱함) |
| `smoothness` | `smoothing.position`·`rotation`·`fov`에 같은 값 |

적용할 때 `target`, `offset`, `focusTarget`은 지우고 `focus`는 끈다. `collisionMargin`, `collisionTargets`, `smoothing`, `focus*`, `enableFocus`는 `WorldCameraOption`에 없으므로 `setCameraOption`으로 넣는다.

**1인칭 주의**: `cameraOption={{ type: 'firstPerson' }}`만 주면 `yDistance`는 8, `zDistance`는 store 기본 15가 남아 눈 높이 8m, 앞 15m로 계산된다. `cameraOption={{ type: 'firstPerson', yDistance: 1.6, zDistance: 0.3, enableCollision: false }}`처럼 주거나 아래 프리셋을 쓴다.

### 실행 중 모드 바꾸기

모드만 바꾸면 거리가 그대로 남으므로 모드별 기본값을 함께 넣는다. `CAMERA_CONTROLLER_MODE_OPTIONS`가 모드별 거리·FOV·충돌·줌·smoothing 표다.

```ts
import { CAMERA_CONTROLLER_MODE_OPTIONS, useGaesupStoreApi, type CameraType } from 'gaesup-world';

function useCameraMode() {
  const store = useGaesupStoreApi();
  return (control: CameraType) => {
    store.getState().setMode({ control });
    store.getState().setCameraOption(CAMERA_CONTROLLER_MODE_OPTIONS[control]);
  };
}
```

- DOM 컴포넌트 `<CameraController />`(모드 버튼)와 `<CameraPresets />`(프리셋 5개)가 같은 일을 한다. 둘 다 Canvas 밖에 둔다. 에디터의 `CameraPanel`에도 들어 있다.
- 런타임 월드에서는 `useGaesupStoreApi()`(가장 가까운 월드)를 쓰고, `useGaesupStore.getState()` 같은 정적 호출은 legacy 전역 store를 가리키므로 쓰지 않는다.

### 마우스·게임패드 궤도와 줌

- 우클릭 또는 가운데 버튼 드래그(4px 넘게), 또는 Ctrl을 누른 채 캔버스 위에서 마우스를 움직이면 궤도가 돈다. 피치는 -0.65 ~ 0.85 rad로 묶인다.
- 좌클릭은 기본으로 월드 상호작용·편집 선택용이다. 카메라 옵션 `dragOrbit: 'all'`(월드의 `cameraOption`으로도 준다)이면 편집 모드 밖에서 왼쪽 드래그도 궤도를 돌린다. 드래그로 끝난 누름은 클릭 이벤트가 창에서 멈춰, 클릭 이동도 NPC·오브젝트 클릭도 되지 않는다. 움직이지 않은 누름은 그대로 클릭이다. 예제 minihome이 켠다.
- 휠은 `zoom`을 바꾼다(거리 배율, 아래로 굴리면 멀어짐). `enableZoom: false`면 꺼진다.
- `mode.controller === 'gamepad'`이고 런타임 월드면 오른쪽 스틱이 궤도를 돌린다(`lookSpeed` 기본 2.5).
- 캔버스 우클릭 메뉴는 막힌다.

### smoothing

`smoothing.position`·`rotation`·`fov`는 0~1 사이 값을 초당 감쇠 속도 `-ln(1-v)×60`으로 바꿔 프레임률과 무관하게 따라간다(기본 0.08 / 0.1 / 0.1). 1 이상은 그 값을 속도로 그대로 쓴다. **0 이하는 속도 0이라 카메라가 멈춘다.** 즉시 따라가게 하려면 큰 값(예: 1000)을 준다. `CAMERA_CONTROLLER_MODE_OPTIONS.fixed`는 smoothing이 0이라 이 프리셋을 쓰면 카메라가 움직이지 않는다. 출처 `src/core/camera/utils/camera.ts`의 `smoothingToSpeed`.

### 카메라 충돌

`enableCollision`이 켜져 있으면 매 프레임 이렇게 한다(`src/core/camera/controllers/BaseController.ts`, `src/core/camera/utils/camera.ts`).

1. 탐사 시작점은 바라보는 지점(보통 캐릭터 발)에서 `max(1, collisionMargin)`m 위, 즉 몸 중심 근처다. 발에서 시작하면 잔디 요철이나 계단 단차에 바로 막혀 카메라가 몸 안으로 무너지기 때문이다.
2. 시작점에서 이번 프레임 카메라 위치까지 반지름 `collisionMargin`(store 기본 0.1)인 구를 쓸어 가장 먼저 닿는 곳 앞에 카메라를 둔다.
3. 조상 중 하나라도 `userData.intangible`이 참인 메시는 무시한다. 기본으로 무시되는 것: 모든 캐릭터·NPC·원격 플레이어, 잔디, GPU 인스턴스 배치 복사본, `GroundClicker`·`TeleportOnClick` 평면. 장식 메시를 빼려면 그룹에 `userData={{ intangible: true }}`를 준다.
4. SkinnedMesh는 삼각형 대신 바인드 포즈 경계로 근사한다.
5. 삼각형이 512개 넘는 정적 지오메트리(합친 소품 칸, 흙길·모래 덮개)는 로컬 XZ 격자에 삼각형을 나눠 두고(`src/core/camera/utils/triangleGrid.ts`, 지오메트리마다 한 번, 정점이 바뀌면 다시), 쓸기 경로가 지나는 칸의 삼각형만 검사한다. 결과는 전부 훑을 때와 같다. 예제 섬에서 걷는 동안 쓸기가 2.28ms에서 0.27ms/프레임이 됐다(2026-09-28, dev, 헤드리스 Chrome).

`setCameraOption({ collisionTargets: 'colliders' })`로 바꾸면 `CAMERA_COLLIDER_LAYER`(30번 레이어)를 켠 메시만 검사하고, 그런 메시가 하나도 없으면 장면 전체로 돌아간다. 후보 메시 목록은 장면에 자식이 붙고 떨어질 때 다시 만든다. 이미 있는 메시의 레이어만 바꿨다면 `invalidateCollisionCache()`를 호출한다.

### 가림 처리 (`collisionMode`)

`collisionMode: 'push'`(기본)는 위처럼 카메라를 가린 물체 앞으로 당긴다. `'fade'`는 카메라를 원래 거리에 두고, 같은 쓸기에서 탐사 시작점과 카메라 사이에 닿은 물체를 0.2초에 걸쳐 `collisionFadeOpacity`(기본 0.3)까지 반투명하게 한다. 더 닿지 않으면 0.15초 뒤 같은 속도로 돌아오고, 다 돌아오면 원래 머티리얼로 되돌린다(`src/core/camera/core/CameraOcclusion.ts`, `seeThrough.ts`). `cameraOption`, `setCameraOption`, 에디터 `CameraPanel`의 조작 탭(`CameraController`의 "가림 처리" 버튼)과 설정 탭("가리면 반투명", "가림 불투명도")에서 실행 중에 바꾼다.

```tsx
<GaesupWorld cameraOption={{ type: 'thirdPerson', xDistance: -4, yDistance: 10, zDistance: -10, fov: 42, collisionMode: 'fade' }}>
```

- **공유 머티리얼은 바꾸지 않는다.** 가린 물체마다 머티리얼 복사본(`transparent`, `depthWrite: false`)을 만들어 그 물체에만 끼운다. 인스턴스에 준 `onBeforeCompile`·`customProgramCacheKey`는 복사본에도 옮긴다. 되돌린 복사본은 다음 가림에 다시 쓰려고 최대 32개까지 두고(다시 쓸 때 원본의 바뀐 값을 따라감), `push`로 돌아가거나 카메라가 내려가면(`CameraSystem.destroy`, 컨트롤러 `dispose()`) 모두 되돌리고 `dispose()`한다.
- **InstancedMesh**(벽·타일·모델 배치)는 배치 전체가 아니라 가린 인스턴스만 흐린다. 그 인스턴스를 배치 안에서 크기 0으로 접고, 같은 지오메트리의 대리 메시(`camera-fade`, `intangible`, raycast 없음)가 복사본으로 그 자리를 그린다. 되돌릴 때 원래 행렬을 돌려놓는다. 그 사이 배치 주인이 행렬을 다시 쓰면(편집) 흐림을 버리고 주인 것을 따른다. 흐린 인스턴스는 클릭되지 않는다.
- **합친 정적 모델 칸**(WebGPU의 32m 칸)은 `geometry.userData.mergedParts`(물체마다 인덱스가 끝나는 곳)로 가린 물체의 삼각형 범위만 따로 그룹으로 나눠 흐린다. 부분 목록이 없는 합친 메시, `BatchedMesh`, `ShaderMaterial`, 보이지 않는 메시, morph 텍스처 인스턴스는 흐릴 수 없어 `push`처럼 막는다.
- **바닥은 흐리지 않는다.** 닿은 면의 법선이 위를 향하면(수직에서 약 37° 안, 바닥·완만한 경사) 그 접촉은 `push`처럼 카메라를 멈춘다. 건물 시스템의 지형(`<WorldProps type="ground">` 아래 전부, 바닥 타일 배치)은 `userData.cameraCollisionMode = 'push'`로 표시되어 절벽 옆면도 흐리지 않는다.
- **물체별 지정**: 메시나 조상의 `userData.cameraCollisionMode`가 `'push'`면 `fade`에서도 막고, `'fade'`면 `push`에서도 흐린다(가장 가까운 조상 값, 바닥 판정 없음). `userData.intangible`인 캐릭터·NPC·원격 플레이어는 지금처럼 검사하지 않으므로 흐려지지 않는다.
- 흐린 물체는 반투명 목록으로 가서 뒤쪽부터 그려지고 깊이를 쓰지 않는다. 그림자는 그대로 드리운다. TRAA를 켜면 흐린 물체 가장자리에 잔상이 조금 남을 수 있다.
- 비용: `push`와 같은 후보 목록·격자 쓸기를 쓴다. `fade` 후보는 가장 가까운 접촉에서 멈추지 않고 경로 위 접촉을 모두 모으며, 매 프레임 할당이 없다. 복사본과 대리 메시는 가림이 시작될 때만 만든다.

### 포커스·클로즈업·시네마틱

- `setCameraOption({ focus: true, focusTarget, focusDistance, focusLerpSpeed })`로 한 점을 비춘다(기본 거리 10, 속도 10). `enableFocus: true`면 Esc가 포커스를 끈다. `clickToMove`가 켜져 있으면 포커스 중 바닥 클릭은 이동 대신 포커스를 푼다.
- `requestCameraCloseUp(target, { focusDistance?, focusLerpSpeed?, fov?, enableCollision?, rememberPrevious? }, storeApi?)`는 이전 설정을 기억하고 클로즈업하며, 되돌리는 함수를 돌려준다. `restoreCameraCloseUp(storeApi?)`로도 되돌린다. `storeApi`를 생략하면 legacy 전역 store를 쓰므로 런타임 월드에서는 `useGaesupStoreApi()` 결과를 넘긴다.
- `playCameraCinematic`, `createCameraCinematicPlayer`는 클로즈업·돌리·궤도·흔들기·페이드·대화 등 비트 목록을 재생한다. 런타임 월드는 `runtime.cinematics`를 쓴다(`src/core/camera/cinematic.ts`).

### `fixedPosition`, `bounds`, `offset`

- `fixedPosition`: `fixed` 모드 카메라가 서는 곳이다. `setCameraOption({ fixedPosition: new Vector3(...) })`로 바꾸고, 지우면 기본 위치로 돌아간다.
- `bounds`(`minX`·`maxX`·`minY`·`maxY`·`minZ`·`maxZ`, 모두 선택): 카메라 목표 위치를 이 상자 안으로 제한한다. 기본값은 없다(제한 없음).
- `offset`: 모드가 정한 카메라 위치에 더하는 월드 좌표 이동이다. 시네마틱 흔들기 비트가 쓰며, 저장하지 않는다.
- 카메라 계산이 읽지 않던 옵션(`target`, `maxDistance`, `position`, `rotation`, `isoAngle`, `minFov`, `maxFov`, `modeSettings`, `mode`, `focusDuration`, `distance`)은 지웠다. 옛 세이브에 남은 값은 복원할 때 버린다.

## 입력

### 흐름

- 키보드: `GaesupController`가 올리는 `useKeyboard`가 키를 입력 백엔드의 키보드 상태(`forward`, `backward`, `leftward`, `rightward`, `shift`, `space`, `keyZ`, `keyR`, `keyF`, `keyE`, `escape`)로 바꾸고, 물리 계산이 그 상태를 읽는다(`src/core/hooks/useKeyboard/index.ts`).
- 키 이벤트는 월드 입력 범위(`WorldInputScope`)가 받는다. 캔버스는 스스로 입력 표면으로 등록되고, 월드가 둘 이상이면 포커스를 가진 표면의 월드만 받는다. `input`·`textarea`·`select`·contenteditable 안의 입력과 Ctrl·Alt·Meta 조합은 무시한다.
- 런타임 월드는 `runtime.setup()` 전에는 입력을 받지 않는다.

### 기본 키

| 입력 | 동작 | 조건·출처 |
|---|---|---|
| W A S D, 방향키 | 이동(차량은 전후·조향) | `useKeyboard`. 키는 기본 입력 액션 표에서 온다 |
| 왼쪽 Shift | 달리기(비행기는 가속) | 오른쪽 Shift는 이동에 매핑되지 않는다 |
| Space | 점프(차량은 제동) | |
| F | 탈것 타기·내리기 | `Rideable`이 있을 때 |
| E | 상호작용 대상 실행, 대화 넘기기 | `InteractionPrompt`/`useInteractionKey`, `DialogBox` |
| Esc | 카메라 포커스 해제, 대화 닫기 | `enableFocus`일 때, `DialogBox` |
| 1–9 | 대화 선택지 | `DialogBox` |
| 우클릭·가운데 드래그, Ctrl+마우스 | 카메라 궤도 | `dragOrbit: 'all'`이면 왼쪽 드래그도 |
| 휠 | 카메라 줌 | `enableZoom` |
| 방향키, Q/E | 회전, 타일 높이 | 건축 편집 모드에서만([building.md](building.md)) |
| Z, R | 키보드 상태만 기록한다 | 기본 동작 없음 |

### 게임패드

실물 게임패드는 **런타임 월드에서 `mode.controller === 'gamepad'`일 때만** 읽는다(`src/core/input/WorldGamepadInput.ts`). 런타임 없이는 게임패드 폴링이 없다.

```ts
const runtime = createGaesupRuntime({ gamepad: { deadzone: 0.2, bindings: { Y: 'keyE', X: null } } });
// <GaesupWorld runtime={runtime} mode={{ type: 'character', controller: 'gamepad' }}>
```

| 입력 | 기본 동작 |
|---|---|
| 왼쪽 스틱, D-pad | 이동. 움직이면 클릭 이동 경로를 취소한다 |
| 오른쪽 스틱 | 카메라 궤도 |
| A | Space(점프) |
| B, Back, Start | Esc |
| X | F(탈것) |
| Y | E(상호작용) |
| RB | Shift(달리기) |

옵션(`WorldGamepadOptions`): `enabled`, `index`(특정 패드), `deadzone`(기본 0.15), `lookSpeed`(2.5), `mapping`(비표준 패드의 축·버튼 번호), `bindings`(버튼 → 키보드 상태 이름, `null`이면 끔). 패드는 `standard` 매핑이거나 `mapping`을 줘야 쓰고, 연결 직후 이미 눌려 있던 버튼·스틱은 한 번 놓을 때까지 무시한다. `createGaesupRuntime({ gamepad: false })`로 끈다. `GamePad`(별칭 `Gamepad`) 컴포넌트는 실물 패드가 아니라 `controller`가 `gamepad`일 때 뜨는 화면 버튼판이다.

### 터치

`<TouchControls />`를 Canvas 밖에 한 번 둔다(`src/core/input/touch/components/TouchControls/index.tsx`). `(pointer: coarse)` 기기에서만 보이고 `forceVisible`로 강제한다.

| prop | 기본값 | 설명 |
|---|---|---|
| `radius` | 60 | 조이스틱 반지름(px) |
| `deadzone` | 0.18 | 이 아래는 입력 없음 |
| `runThreshold` | 0.8 | 넘으면 Shift(달리기)도 켬 |
| `actions` | 점프(Space), 사용(F) | `{ id, label, key?, onPress?, onRelease? }[]` |

조이스틱은 방향을 W/A/S/D 상태로 바꾸고, 버튼은 `key`를 가짜 키 이벤트로 보낸다. 기본 버튼에 E가 없으므로 상호작용을 쓰려면 `actions={[{ id: 'jump', label: '점프', key: ' ' }, { id: 'talk', label: '대화', key: 'e' }]}`처럼 넣는다.

### 게임 코드에서 키 받기

두 API가 있고 둘 다 캐릭터 이동과는 별개다.

1. **`useWorldInputActions().register(id, binding)`**: 키가 눌리는 순간(상승 에지) 콜백을 부른다. 같은 `id`는 마지막 등록이 받고, 해제 함수를 돌려준다. `key`는 `'i'`, `'space'`, `'shift'`, `'escape'`처럼 소문자 이름(`KeyI` → `i`)이고 함수로 줄 수도 있다. `cooldownMs`로 연타를 막고, `execute`가 `false`를 돌려주면 실행하지 않은 것으로 친다. 출처 `src/core/input/WorldInputActions.ts`.

   ```ts
   const actions = useWorldInputActions();
   useEffect(() => actions.register('game.map', { key: 'm', execute: () => setMapOpen((v) => !v) }), [actions]);
   ```

2. **`useInputActions({ definitions?, active?, onFrame? })`**: 매 프레임 `input` 단계에서 키보드·마우스·게임패드를 폴링해 `InputActionMap`을 평가한다. Canvas 안에서 쓴다. `map.get(name)`은 `{ pressed, down, up, value, x, y }`이고 누름 임계값은 0.5, 기본 데드존은 0.15다. 기본 정의(`createDefaultInputActions()`, `src/core/input/actions/defaults.ts`):

   | 액션 | 종류 | 키보드 | 게임패드 | 터치 |
   |---|---|---|---|---|
   | `move` | axis2D | W/S/A/D, 방향키 | 왼쪽 스틱(`axis:0`, `axis:1`) | `stick:x`, `stick:y` |
   | `jump` | button | Space | `button:0`(South) | `button:jump` |
   | `run` | button | 왼쪽·오른쪽 Shift | `button:10`(왼쪽 스틱 누름) | `button:run` |
   | `interact` | button | E | `button:2`(West) | `button:interact` |

   조작 캐릭터(`useKeyboard`)는 이 표의 키보드 바인딩에서 이동·점프·달리기·상호작용 키를 가져온다. 그래서 방향키와 오른쪽 Shift도 캐릭터를 움직인다. 프로젝트 설정의 입력 바인딩으로 다시 묶는 것은 아직 연결되지 않았다(PRD DEAD-1). 터치 바인딩은 `useInputActions`의 장치 상태를 채우는 코드가 없어 지금은 동작하지 않는다. `InputRecorder`/`InputReplay`로 프레임을 녹화·재생하고, `inputActionsFromProjectSettings(bindings, kinds?)`로 프로젝트 설정의 바인딩을 정의로 바꾼다.

### 오버레이와 여러 월드

- 월드에 속한 DOM 오버레이는 `<WorldInputSurface>`로 감싸면 그 안의 키 입력이 해당 월드로 간다.
- `useWorldInputScope().dispatchKey('keydown' | 'keyup', key, source?)`로 가짜 키를 보낸다(터치 버튼이 쓰는 방식).

## 클릭 이동

`clickToMove`를 켜면 `GroundClicker`(캐릭터에 붙어 따라다니는 보이지 않는 1000×1000m 평면)와, 캐릭터 밖 월드 좌표에 그리는 `Clicker`(목표 표식·경로 선)가 올라간다(`src/core/interactions/components/GroundClicker/index.tsx`, `src/core/hooks/useClicker/index.ts`).

- 왼쪽 버튼 클릭(누른 채 4px 넘게 움직이지 않은 것)만 이동한다. 평면이 받은 광선을 내비게이션 높이를 따라 걸어 처음 만나는 땅을 목적지로 삼으므로, 올라간 타일을 누르면 그 윗면이 찍힌다. 바위·연못처럼 설 수 없는 곳을 누르면 캐릭터가 오는 쪽의 가장 가까운 설 수 있는 곳(내비게이션 칸 둘 안)으로 간다.
- 그 지점까지 `NavigationSystem`(WASM A*) 경로를 만든다. 직선으로 보이면 경로 없이 곧장 가고, 경로를 못 찾으면 장애물이 전혀 없을 때만 직선으로 간다. 표식은 지금 걷는 경유점이 아니라 목적지의 땅 위에 서고, 풀 위로 보이게 그린다.
- 장애물은 건축 데이터에서 온다. `BuildingController`가 올리는 `NPCSystem` 안의 `BuildingNavigationObstacleDriver`가 벽(문·아치 제외)·블록·오브젝트를 막힘으로, 타일을 높이로 넣는다. `BuildingController` 없이는 장애물이 없다.
- Alt·Ctrl·Meta·Shift를 누른 클릭은 무시한다(`TeleportOnClick` 같은 도구용). 카메라 포커스 중 클릭은 포커스만 푼다.
- 이동 중에는 목적지에 닿을 때까지 마우스 목표가 방향을 정하고 키보드 방향은 무시된다. 게임패드 이동 입력은 경로를 취소한다.

`clickerOptions`(`ClickerMoveOptions`):

| 필드 | 기본값 | 설명 |
|---|---|---|
| `useNavigation` | `true` | 끄면 항상 직선 |
| `simplifyPath` | `true` | 경로 다듬기 |
| `waypointThreshold` | 1 | 경유점 도달 거리(m) |
| `fallbackToDirectOnFail` | `true` | 경로 실패 시 직선(장애물이 없을 때만) |
| `agentRadius` | `colliderSize.radius` 또는 0.35 | 길찾기 몸 반지름 |
| `agentWidth`, `agentDepth`, `clearance` | 없음 | 사각 몸 크기, 여유 |
| `offsetY`, `minHeight` | 0.5, 0.5 | 목표 높이 보정 |

직접 만들 때는 `useClicker(options)`의 `moveClicker(event, isRun, 'ground')`·`stopClicker()`를 쓴다.

## 상호작용

플레이어 근처의 대상에 안내를 띄우고 키로 실행한다(`src/core/interactions/components/Interactable/index.tsx`, `src/core/interactions/hooks/useInteractionTarget.ts`, `src/core/interactions/stores/interactablesStore.ts`).

| 조각 | 위치 | 역할 |
|---|---|---|
| `<Interactable>` | Canvas 안 | 대상 등록. 자식을 `position`에 그린다 |
| `<InteractionTracker throttleMs={80} />` | Canvas 안, 한 번 | 플레이어 위치로 가장 가까운 범위 안 대상을 고른다. **없으면 대상이 선택되지 않는다** |
| `<InteractionPrompt />` | Canvas 밖, 한 번 | 선택된 대상의 키·이름·거리를 보이고 그 키를 실행에 연결한다(`useInteractionKey`) |
| `useCurrentInteraction()` | 어디서나 | `{ id, label, key, distance } \| null` |

`Interactable` props: `label`(필수), `onActivate`(필수), `position: [x, y, z]`(필수), `id`(없으면 자동), `kind`(`'pickup' \| 'npc' \| 'door' \| 'shop' \| 'storage' \| 'tool-target' \| 'misc'`, 기본 `misc`), `range`(기본 2.2m), `activationKey`(기본 `'e'`), `data`, `children`. `onActivate`는 등록 효과의 의존성이므로 `useCallback`으로 고정한다.

```tsx
function Signpost() {
  const start = useDialogStore((s) => s.start);
  const read = useCallback(() => { start('sign.welcome'); }, [start]);
  return (
    <Interactable id="sign" label="표지판 읽기" position={[4, 0, 4]} onActivate={read}>
      <mesh position={[0, 1, 0]}><boxGeometry args={[1, 2, 0.2]} /><meshStandardMaterial color="#c8a27a" /></mesh>
    </Interactable>
  );
}
```

움직이는 대상(NPC 등)은 컴포넌트 대신 store에 직접 등록하고 `getPosition`으로 매 탐색 때 위치를 준다. 예시는 [npc-dialog-gameplay.md](npc-dialog-gameplay.md#npc와-대화-연결).

```ts
useInteractablesStoreApi().getState().register({ id, kind: 'npc', label, key: 'e', range: 2.5,
  position: start.clone(), getPosition: () => livePosition, onActivate });
```

실행할 때 대상까지 거리를 다시 재서 범위를 벗어났으면 실행하지 않는다. 런타임 월드에서는 `setup()` 전과 `dispose()` 뒤에 추적·실행이 멈춘다.

## 텔레포트

| API | 설명 |
|---|---|
| `useTeleport()` | `{ teleport(position: Vector3, rotation?: Euler, options?), canTeleport }`. `options.dropHeight`(기본 7m)와 `options.effect`(`false` 또는 `{ kind: 'instant' \| 'drop', durationMs }`, 기본 0.9초 낙하 연출) |
| `<Teleport position text? teleportStyle? />` | DOM 버튼 |
| `<TeleportMarker destination enabled? yOffset? onTeleport? />` | 목적지 고리·기둥. 누르면 이동 |
| `<TeleportOnClick modifierKey="altKey" />` | 수정키+클릭한 바닥으로 이동(기본 Alt). 평면은 `intangible` |
| `createTeleportDestination({ id, name, position, radius?, markerColor? })` | 목적지 정규화(기본 반지름 1.4). `findTeleportDestination`, `teleportDestinationToVector3` |
| `<TeleportDropEffect />` | 낙하 연출 효과(Canvas 안) |

요청은 motions 이벤트(`MOTIONS_TELEPORT_EVENT`, `requestMotionsTeleport`)로 물리 몸체에 전달된다. 런타임 월드에서는 `motions.runtime` 서비스가 있어야 이 경로를 쓰는데, 이 서비스는 `motionsPlugin`이 등록한다. 서비스가 없으면 요청이 window 이벤트로 가고 런타임 월드의 물리 브리지는 그 이벤트를 듣지 않는다. 런타임 월드에서 텔레포트를 쓰면 `createGaesupRuntime({ plugins: [motionsPlugin] })`로 등록한다(코드 경로 기준이며 브라우저에서 확인하지 않았다).

## 알려진 제한

- 프로젝트 설정의 입력 바인딩(`moveForward` 등)은 조작 캐릭터에 연결되지 않는다.
- 실물 게임패드는 런타임 월드에서만 동작한다.
- `smoothing: 0`은 카메라를 멈춘다.
- `InteractionTracker`를 따로 올려야 상호작용이 동작한다. NPC는 상호작용 대상을 스스로 등록하지 않는다.
- 탈것은 예제·브라우저 검증 경로가 없고, 바퀴를 따로 그리지 않는다(바퀴는 탈것 모델에 포함한다).
- 터치 기본 버튼에 상호작용 키가 없다.

## 관련 문서

- [getting-started.md](getting-started.md) · [world-runtime.md](world-runtime.md) · [rendering.md](rendering.md)
- [building.md](building.md) · [npc-dialog-gameplay.md](npc-dialog-gameplay.md) · [save-network.md](save-network.md)
- [performance.md](performance.md) · [api-map.md](api-map.md)
- [../dev/architecture.md](../dev/architecture.md) · [../dev/module-status.md](../dev/module-status.md)
