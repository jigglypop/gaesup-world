# Gaesup API 사용 가이드: 움직이는 캐릭터 만들기

이 가이드는 Gaesup 라이브러리 사용자가 가장 간단한 방법으로 물리 효과가 적용된 캐릭터를 생성하고 조작하는 방법을 안내합니다.

## 1. 사전 준비: Blueprint 정의

먼저, 캐릭터의 모든 속성을 정의하는 `Blueprint` 파일을 만듭니다. 이 파일은 순수한 데이터 객체입니다.

```typescript
// src/gamedata/blueprints/MyCharacter.ts

import { CharacterBlueprint } from '@gaesup/core'; // (가상 경로)

export const MY_CHARACTER_BLUEPRINT: CharacterBlueprint = {
  id: 'my-char-01',
  name: '내 캐릭터',
  type: 'character',
  
  // 물리 속성 (가장 중요)
  physics: {
    mass: 70,
    jumpForce: 350,
    // ...
  },
  
  // 애니메이션 파일 경로
  animations: {
    idle: '/animations/idle.glb',
    walk: '/animations/walk.glb',
    // ...
  },
  // ... 기타 필요한 속성
};
```

## 2. 핵심 컴포넌트: `<GaesupController>`

`<GaesupController>`는 캐릭터의 물리, 애니메이션, 상태 동기화를 모두 관리하는 메인 컨트롤러 컴포넌트입니다. `blueprint`를 `prop`으로 전달하기만 하면 모든 설정이 완료됩니다.

```tsx
// src/components/MyScene.tsx

import { Canvas } from '@react-three/fiber';
import { GaesupController } from '@gaesup/core'; // (가상 경로)
import { MY_CHARACTER_BLUEPRINT } from '../gamedata/blueprints/MyCharacter';

export function MyScene() {
  return (
    <Canvas>
      {/* GaesupController에 blueprint만 전달하면 캐릭터가 생성됩니다. */}
      <GaesupController blueprint={MY_CHARACTER_BLUEPRINT}>
        {/* 여기에 캐릭터의 3D 모델(Mesh)을 자식으로 넣어주세요. */}
        {/* 예: <MyCharacterModel /> */}
      </GaesupController>
    </Canvas>
  );
}
```

## 3. 캐릭터 조작: `useGaesupPlayer` Hook

생성된 캐릭터를 조작하려면 `useGaesupPlayer` 훅을 사용합니다. 이 훅은 캐릭터를 조작할 수 있는 함수들(e.g., `move`, `jump`)을 반환합니다.

```tsx
// src/components/PlayerControls.tsx

import { useGaesupPlayer } from '@gaesup/core'; // (가상 경로)
import { useKeyboardControls } from '@react-three/drei'; // (예시)

export function PlayerControls() {
  // 1. 조작 함수들을 가져옵니다.
  const { move, jump } = useGaesupPlayer();
  const [sub, get] = useKeyboardControls();

  // 2. 키보드 입력에 따라 조작 함수를 호출합니다.
  useEffect(() => {
    return sub(
      (state) => state.forward || state.backward || state.left || state.right,
      (pressed) => {
        const { forward, backward, left, right } = get();
        // 'move' 명령 전송
        move({ x: left - right, y: 0, z: backward - forward });
      }
    );
  }, [move, get, sub]);

  useEffect(() => {
    return sub(
      (state) => state.jump,
      (pressed) => {
        if (pressed) {
          // 'jump' 명령 전송
          jump();
        }
      }
    );
  }, [jump, sub]);
  
  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
}

// MyScene에 추가
function MyScene() {
  return (
    <Canvas>
      <KeyboardControls map={[... ]}>
        <GaesupController blueprint={...}>
          <MyCharacterModel />
        </GaesupController>
        
        {/* PlayerControls 컴포넌트를 추가하여 조작을 활성화합니다. */}
        <PlayerControls />
      </KeyboardControls>
    </Canvas>
  )
}
```

## 4. 상태 구독: `useGaesupState` Hook

캐릭터의 현재 상태(위치, 속도 등)를 UI에 표시하려면 `useGaesupState` 훅을 사용합니다.

```tsx
// src/components/CharacterUI.tsx

import { useGaesupState } from '@gaesup/core'; // (가상 경로)

export function CharacterUI({ characterId }) {
  // 1. 캐릭터 ID로 현재 상태 스냅샷을 구독합니다.
  const snapshot = useGaesupState(characterId);

  if (!snapshot) return null;
  
  // 2. 스냅샷 데이터를 UI에 표시합니다.
  return (
    <div>
      <p>Position: {snapshot.position.x.toFixed(2)}, {snapshot.position.z.toFixed(2)}</p>
      <p>Velocity: {snapshot.velocity.length().toFixed(2)}</p>
      <p>Is Moving: {snapshot.isMoving ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## 요약

| 목적 | 사용하는 API | 비고 |
| :--- | :--- | :--- |
| **캐릭터 생성** | `<GaesupController blueprint={...} />` | 모든 것의 시작점. `blueprint`가 필수. |
| **캐릭터 조작** | `useGaesupPlayer()` | `move`, `jump` 등 명령 함수 반환. |
| **상태 조회** | `useGaesupState(id)` | 실시간 `snapshot` 데이터 반환. |

이 세 가지 API를 통해 Gaesup 라이브러리의 핵심 기능을 간단하게 사용할 수 있습니다. 