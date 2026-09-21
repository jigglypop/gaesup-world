# Character ground support

`PhysicsSystem` uses contacts from the owning Rapier world. World height and a small vertical velocity do not establish ground support. The world uses +Y as up. `gameStates.isOnTheGround` and `activeState.isGround` describe the same support; a jump clears both on the injected state manager.

## Connecting the physics world

`PhysicsEntity` obtains its world from its surrounding `<Physics>` provider and forwards it through `useEntity` to `usePhysicsBridge`. A custom rigid-body component must provide that world explicitly:

```tsx
import { useRef } from 'react';
import { RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { usePhysicsBridge } from 'gaesup-world';

function Player() {
  const body = useRef<RapierRigidBody>(null!);
  const { world } = useRapier();
  usePhysicsBridge({ entityId: 'player', rigidBodyRef: body, physicsWorld: world });
  return <RigidBody ref={body}><mesh><boxGeometry /><meshStandardMaterial /></mesh></RigidBody>;
}
```

Direct `PhysicsSystem.calculate` callers likewise pass `physicsWorld` in `PhysicsCalcProps`. An absent world, a removed/disabled body, or a body belonging to another world returns unsupported. Contacts become available after a physics step; merely positioning a new body near a surface is insufficient. Supply the same `EntityStateManager` to the system and its `PhysicsState` when sharing jump state.

## Support rules

- `maxGroundSlopeAngle`: maximum support slope in radians; default `Math.PI / 4` (45°).
- `groundContactTolerance`: allowed separation when rechecking current contact geometry; default `0.03` world units. This is a contact tolerance, not a global ground-ray length.
- Sensors, disabled supports, incompatible collision/solver groups, walls, ceilings, excessive slopes, and separating motion do not provide support.
- Relative velocity includes the support body's linear and angular velocity at the contact point. Moving platforms are not rejected solely because the actor has upward world velocity.
- Current collider positions are propagated before queries. Teleporting away from a support does not retain a previous frame's grounded flag.
- Current solver witnesses are reused when nearby. Tangential movement rechecks the surface locally; contact/shape casts handle other cases and composite terrain. Queries are restricted to contact-pair candidates.

## Custom collision policies

Rapier's `SolverFlags.EMPTY` can retain contact manifolds while disabling impulses. The public manifold API does not expose those flags. For detection-only contacts or custom one-way policies, share the policy with the optional `groundContactFilter(actorCollider, supportCollider)` on `PhysicsEntity`, `useEntity`, `usePhysicsBridge`, or `PhysicsCalcProps`:

```tsx
<PhysicsEntity
  name="player"
  url="/player.glb"
  componentType="character"
  isActive
  groundContactFilter={(_actor, support) => !detectionOnlyHandles.has(support.handle)}
/>
```

Keep that policy consistent with the Rapier contact hook. Returning `false` excludes a candidate; returning `true` does not override contact, slope, group, or velocity checks. Removed collider handles must be removed from application-owned policy sets. Standard sensor and collision/solver-group filtering is automatic.

## Evidence and limits

`/performance` provides `locomotion` (direct real-physics scenarios) and `entity-grounding` (public entity → hooks → bridge). Tests cover elevated floors, jumps, held/released input, moving/rotating supports, slopes, sensors, disabled/removed bodies, triangle meshes, world isolation, teleportation and large-floor motion. `scripts/performance/grounding-probe.cjs` checks explicitly selected installed Rapier modules and records raw timings for 100/1,000 supported actors.

Those Node timings measure contact queries only. They exclude render cost and are not FPS budgets. The public entity browser scenario currently exercises the installed React 19/R3F 9/Rapier 2 combination. The full peer/browser/device matrix and integrated stair/controller/camera journeys remain tracked in [the execution record](prd-execution-2026-09.md).

접지 판정은 실제 물리 접촉을 기준으로 합니다. 기본 `PhysicsEntity`는 월드를 자동 연결하지만 직접 훅을 사용하는 컴포넌트는 `physicsWorld`를 전달해야 합니다. 사용자 정의 감지 전용/단방향 충돌 정책은 `groundContactFilter`와 공유합니다. 단위 검사·Node 질의 시간·브라우저 기능 검사는 각각 별도의 증거이며 전체 플랫폼 인수를 뜻하지 않습니다.
