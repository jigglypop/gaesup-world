# Gaesup API 사용 가이드

이 문서는 현재 공개 패키지 기준으로 가장 기본적인 월드 실행 방법을 정리합니다.

## 패키지 엔트리

기본 런타임 API는 루트 엔트리에서 가져옵니다.

```tsx
import { GaesupController, GaesupWorld } from 'gaesup-world';
```

관리자와 블루프린트 에디터는 별도 subpath를 사용합니다.

```tsx
import { GaesupAdmin, useAuthStore } from 'gaesup-world/admin';
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';
```

현재 관리되는 주요 subpath는 아래와 같습니다.

- `gaesup-world`: 메인 런타임, 월드, 도메인 API
- `gaesup-world/admin`: 관리자 래퍼 UI
- `gaesup-world/blueprints`: 블루프린트 런타임 API
- `gaesup-world/blueprints/editor`: 블루프린트 편집 UI
- `gaesup-world/runtime`: 런타임 중심 API
- `gaesup-world/assets`: 에셋 API
- `gaesup-world/network`: 네트워크 API
- `gaesup-world/plugins`: 플러그인 API
- `gaesup-world/style.css`: 기본 스타일

## 기본 월드

`GaesupWorld`는 월드 설정을 store에 주입하는 루트 컴포넌트입니다. 실제 3D 렌더링은 React Three Fiber의 `Canvas` 안에서 구성합니다.

```tsx
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupController, GaesupWorld } from 'gaesup-world';

export function App() {
  return (
    <GaesupWorld
      urls={{ characterUrl: '/models/character.glb' }}
      mode={{ type: 'character', controller: 'keyboard', control: 'thirdPerson' }}
      cameraOption={{
        xDistance: -7,
        yDistance: 10,
        zDistance: -13,
        fov: 75,
        enableCollision: true,
      }}
    >
      <Canvas shadows>
        <Physics>
          <GaesupController />
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

`GaesupController`는 현재 공개 API에서 `blueprint` prop을 받는 생성기 컴포넌트가 아닙니다. 캐릭터 URL, 입력 방식, 카메라 방식은 `GaesupWorld`의 `urls`, `mode`, `cameraOption`으로 설정합니다.

## 상태 조회

플레이어 위치처럼 자주 쓰는 상태는 공개 훅을 사용합니다.

```tsx
import { usePlayerPosition } from 'gaesup-world';

export function PlayerPositionText() {
  const position = usePlayerPosition();
  return <div>{position.join(', ')}</div>;
}
```

월드 설정 store가 필요하면 selector로 필요한 값만 구독합니다.

```tsx
import { useGaesupStore } from 'gaesup-world';

export function CurrentModeLabel() {
  const control = useGaesupStore((state) => state.mode.control);
  return <span>{control}</span>;
}
```

## 블루프린트 사용

블루프린트 조회와 스폰 API는 루트 엔트리 또는 `gaesup-world/blueprints`에서 사용할 수 있습니다.

```tsx
import { BlueprintSpawner, blueprintRegistry, useSpawnFromBlueprint } from 'gaesup-world';

const warrior = blueprintRegistry.get('warrior');
```

편집 UI는 별도 엔트리입니다.

```tsx
import { BlueprintEditor } from 'gaesup-world/blueprints/editor';
```

## 자주 쓰는 도메인 API

- 월드/컨트롤러: `GaesupWorld`, `GaesupController`, `useGaesupStore`
- 카메라: `Camera`, `CameraPresets`, `CameraDebugPanel`
- 모션: `MotionController`, `MotionUI`, `usePlayerPosition`, `useStateSystem`
- 건설: `BuildingUI`, `BuildingController`, `useBuildingEditor`, `useBuildingStore`
- 저장: `SaveSystem`, `getSaveSystem`, `createDefaultSaveSystem`, `DuplicateSaveDomainBindingError`
- 생활형 도메인: `useInventoryStore`, `InventoryUI`, `HotbarUI`, `useGameTime`, `WeatherEffect`, `QuestLogUI`

## 저장 API 메모

`SaveSystem`은 domain key 기준으로 serialize/hydrate binding을 등록합니다. 같은 key를 두 번 등록하면 `DuplicateSaveDomainBindingError`가 발생합니다. 이 동작은 여러 플러그인이나 런타임이 같은 저장 도메인을 조용히 덮어쓰는 문제를 막기 위한 보호 장치입니다.

```ts
import { SaveSystem } from 'gaesup-world';

const unregister = saveSystem.register({
  key: 'wallet',
  serialize: () => ({ coins: 100 }),
  hydrate: (data) => {
    // restore wallet state here
  },
});

unregister();
```

## 함께 볼 문서

- [README](../../README.md)
- [Building API](../api/BUILDING_API.md)
- [Blueprint API](../api/BLUEPRINT_API.md)
- [Rendering API](../api/RENDERING_API.md)
- [Performance API](../api/PERFORMANCE_API.md)
