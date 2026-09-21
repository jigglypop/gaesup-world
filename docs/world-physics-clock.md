# 월드 고정 clock과 물리

`WorldPhysics`는 Rapier의 공개 `step` API를 runtime의 고정 clock에 등록한다. 물리 조작은 `simulation`, Rapier 적분은 `physics`, 네트워크는 `postSimulation` 순서로 실행한다. 기본값은 초당 60 tick이며, 화면 프레임 수가 계산 횟수를 바꾸지 않는다.

```tsx
import { Canvas } from '@react-three/fiber';
import { GaesupRuntimeProvider, WorldPhysics, PhysicsEntity } from 'gaesup-world';

<GaesupRuntimeProvider runtime={runtime}>
  <Canvas>
    <WorldPhysics gravity={[0, -9.81, 0]}>
      <PhysicsEntity name="player" url="/player.glb" isActive componentType="character" />
    </WorldPhysics>
  </Canvas>
</GaesupRuntimeProvider>
```

`runtime.setup()`을 먼저 호출한다. `WorldPhysics`가 공유 clock lease를 획득하며 여러 물리 장면과 네트워크 소비자도 runtime별 RAF 하나를 공유한다. `paused`는 해당 물리 장면과 조작만 멈춘다. runtime 종료는 모든 소유 시스템을 즉시 멈추며 재설정하면 기존 컴포넌트도 재개한다. 서로 독립적인 월드는 별도 runtime을 사용한다.

공개 `PhysicsEntity`의 입력·접지 계산은 `WorldPhysics` 안에서 고정 tick을 사용한다. 직접 Rapier `Physics`를 사용하는 기존 소비자는 기존 렌더 프레임 경로를 유지한다. 라이브러리의 multiplayer 화면, blueprint preview, NPC 편집 preview는 `WorldPhysics`로 전환했다.

직접 만든 물체는 `useWorldPhysicsStep((state, delta) => { ... })`로 조작 계산을 등록할 수 있다. 이 훅은 소유 clock이 있으면 `true`를 반환한다. `useWorldPhysicsInterpolation(bodyRef)`가 반환한 ref를 RigidBody 아래의 시각용 group에 연결하면 표시 위치와 회전만 이전/현재 물리 tick 사이에서 보간한다. collider는 이 group 밖에 둔다. `PhysicsEntity`에는 이 경로가 기본 연결되어 있다. 원본 Rapier RigidBody에는 이 훅을 명시적으로 연결해야 한다. `interpolate={false}`는 최신 물리 자세를 그대로 표시한다.

물리 clock의 timestep이 기준이므로 `WorldPhysics`에는 별도의 `timeStep`이나 `updateLoop` 옵션이 없다. 수동 재생에서는 `runtime.clockLoop.suspend()`로 RAF만 멈추고 `clock.advance(seconds)` 또는 `clock.stepTicks(count)`를 호출한다. runtime 자체를 dispose하면 수동 tick에서도 물리 작업이 실행되지 않는다.

검증은 `/performance`의 `world-physics-clock`에서 재현한다. 실제 Rapier·공개 엔티티에 같은 tick 입력을 주고 30/60/144Hz의 180 tick 전체 위치, 점프·착지·화면 보간, 종료·해제 결과를 비교한다. WebGL과 네이티브 WebGPU 기록은 [증거 번들](../examples/performance/baselines/2026-09-21-s2-physics-clock.json)에 보존한다. 이는 기능 동등성 검사이며, 전체 NPC·게임패드 clock 통합이나 부하 성능 인수를 뜻하지 않는다.
