# Gaesup World

[![Version](https://img.shields.io/npm/v/gaesup-world?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/gaesup-world)
[![Downloads](https://img.shields.io/npm/dt/gaesup-world.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/gaesup-world)

Web 3D Character Controller and World Platform Library

[![main](https://github.com/jigglypop/gaesup-world/blob/master/image/main_image.png)](https://codesandbox.io/p/github/jigglypop/gaesup-world-examples/master?workspaceId=e8ae627a-af61-415e-aa21-1fe5af422c86)

> click and watch code sandbox example!

---

## introduction

Gaesup World is a library that uses @react/three-fiber, @react/three-drei, and rapier to provide control tools for characters, airplanes, cars, and more in a web 3D environment. This controller is designed to easily manage character movement, animation, and interaction. It allows for easy manipulation of characters or vehicles in a virtual world, and is also equipped with utilities like minimaps and joysticks.

## How to start

```tsx
"use client";

import { Environment, KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";

import { GaesupController, GaesupWorld } from "gaesup-world";

export const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "space", keys: ["Space"] },
  { name: "shift", keys: ["Shift"] },
  { name: "keyZ", keys: ["KeyZ"] },
];

export default function App() {
  const CHARACTER_URL = "./gaesupyee.glb";

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
    >
      <Canvas shadows style={{ width: "100dvw", height: "100dvh" }}>
        <Environment background preset="sunset" blur={0.8} />
        <Physics>
          <KeyboardControls map={keyboardMap}>
            <GaesupController
              groupProps={{
                rotation: [0, Math.PI, 0],
              }}
            />
          </KeyboardControls>
          <RigidBody type="fixed">
            <mesh receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={[300, 5, 300]} />
              <meshStandardMaterial />
            </mesh>
          </RigidBody>
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

### Features

- 3D character control based on React Three Fiber.
- Simple API for controlling character movement and animation.
- Extensible structure for various customizations.
- Lightweight library for fast loading and performance optimization.

### Installation

```bash
npm install @react-three/fiber @react-three/drei three @types/three @react-three/rapier gaesup-world
```

Or

```bash
yarn add @react-three/fiber @react-three/drei three @types/three @react-three/rapier gaesup-world
```

### Documentation

it is detailed usage methods and API documentation

- [how to contribute](#how-to-contribute)

### How to Contribute

If you would like to contribute to this project, please follow these steps:

1. Fork the project.
2. Create a new Feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Create a Pull Request.

### License

This project is distributed under the MIT License.

---

## Controller

#### [Controller](#controller)

- [Character](#character)
- [Vehicle](#vehicle)
- [Airplane](#airplane)

## Character

This is the character control in Gaesup World.

- Possible Camera Types

| Name   | Camera              | Control       | Info                                                                                          |
| ------ | ------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| Normal | Perspective Camera  | Orbit Control | Positioned parallel to the Z-axis from the character's location and not affected by rotation. |
| Orbit  | Perspective Camera  | Orbit Control | Moves with the character and rotates according to the character's direction.                  |
| Map    | Orthographic Camera | Map Control   | A top-down control view.                                                                      |

- Controller Tools

| Name     | Info                                                                    |
| -------- | ----------------------------------------------------------------------- |
| Keyboard | A standard keyboard tool. You can see where on the keyboard is clicked. |
| Joystick | A joystick implementation tool. It works on mobile devices.             |
| Gameboy  | A Gameboy implementation tool. It works on mobile devices.              |

## Vehicle

This is the vehicle control in Gaesup World. Characters can board the vehicle.

- Possible Camera Types

| Name   | Camera              | Control       | Info                                                                                          |
| ------ | ------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| Normal | Perspective Camera  | Orbit Control | Positioned parallel to the Z-axis from the character's location and not affected by rotation. |
| Orbit  | Perspective Camera  | Orbit Control | Moves with the character and rotates according to the character's direction.                  |
| Map    | Orthographic Camera | Map Control   | A top-down control view.                                                                      |

- Controller Tools

| Name     | Info                                                                    |
| -------- | ----------------------------------------------------------------------- |
| Keyboard | A standard keyboard tool. You can see where on the keyboard is clicked. |
| Joystick | A joystick implementation tool. It works on mobile devices.             |
| Gameboy  | A Gameboy implementation tool. It works on mobile devices.              |

## Airplane

This is the airplane control in Gaesup World. Characters can board the airplane.

- Possible Camera Types

| Name   | Camera              | Control       | Info                                                                                          |
| ------ | ------------------- | ------------- | --------------------------------------------------------------------------------------------- |
| Normal | Perspective Camera  | Orbit Control | Positioned parallel to the Z-axis from the character's location and not affected by rotation. |
| Orbit  | Perspective Camera  | Orbit Control | Moves with the character and rotates according to the character's direction.                  |
| Map    | Orthographic Camera | Map Control   | A top-down control view.                                                                      |

- Controller Tools

| Name     | Info                                                                    |
| -------- | ----------------------------------------------------------------------- |
| Keyboard | A standard keyboard tool. You can see where on the keyboard is clicked. |
| Joystick | A joystick implementation tool. It works on mobile devices.             |
| Gameboy  | A Gameboy implementation tool. It works on mobile devices.              |

---

# Tools

- 개숲월드에서 캐릭터 컨트롤을 도와주는 다양한 도구들입니다.

#### 1) [joystick](#joystick)

#### 2) [keyboardtooltip](#keyBoardTooltip)

#### [minimap](#minimap)

#### [gameboy](#gameboy)

1. JoyStick

- This component provides a virtual joystick interface. It is recommended for use in mobile environments.

> Caution! Due to position fluctuation in mobile environments, it is recommended to use the scrollBlock option of GaesupWorld.

### (2) Features

Joystick Interface for Mobile and Other Environments: Provides a joystick interface in environments like mobile.
Custom Appearance: Receives joyStickBallStyle and joyStickStyle properties for styling the joystick and its ball.
Responsive and Interactive: Supports mouse and mobile touch events to cater to various devices.

### (3) Props

joyStickBallStyle: Style of the joystick ball (React.CSSProperties object).
joyStickStyle: Style of the joystick container (React.CSSProperties object).

### (4) How To Use

- Include the JoyStick component in your `GaesupWorld` component tree.

> It is imperative to use it inside the GaesupWorld component

- The component responds to mouse and touch inputs to control movement.

- (Optional) Customize the necessary style using joyStickBallStyle and joyStickStyle.

### (5) Example

```jsx
const MyComponent = () => {
  // 커스텀 스타일 정의
  const joyStickStyle = {
    /* 여기에 조이스틱 컨테이너 스타일을 정의하세요 */
  };
  const joyStickBallStyle = {
    /* 여기에 조이스틱 공의 스타일을 정의하세요 */
  };

  return (
    <JoyStick
      joyStickStyle={joyStickStyle}
      joyStickBallStyle={joyStickBallStyle}
    />
  );
};
```

## 2) keyBoardTooltip

### (1) 개요

- 키보드 컨트롤러 인터페이스를 시각적으로 표시하기 위해 만든 컴포넌트입니다. 키보드의 각 키와 연결된 액션을 시각적으로 나타냅니다.

### (2) 특징

- **키 배열 시각화** : 키보드의 모든 키를 배열 형태로 시각화합니다.
- **애니메이션 상태 반영** : 현재 활성화된 키와 연관된 액션을 다른 스타일로 표시하여 사용자에게 피드백을 제공합니다.
- **커스텀 스타일링** : 키 캡의 스타일을 사용자 정의할 수 있도록 다양한 스타일링 속성을 제공합니다.

### (3) How To Use

1. `KeyBoardToolTip` 컴포넌트를 `GaesupWorld` 컴포넌트에 포함시킵니다.
2. mode의 `control`는 `keyboard` 로 정의합니다.
3. 컴포넌트는 `KeyBoardAll` 상수에 따라 키보드의 각 키를 시각화하고, 현재 활성화된 키에 대해 다른 스타일을 적용합니다.
4. (선택) 필요한 스타일을 `keyBoardToolTipInnerStyle`, `selectedKeyCapStyle`, `notSelectedkeyCapStyle`, `keyCapStyle` 속성을 통해 전달합니다.

### (5) Example

```jsx
import { KeyBoardToolTip } from "./KeyBoardToolTip";
import { GaesupWorldContext } from "../../world/context";

const MyComponent = () => {
  const keyBoardToolTipInnerStyle = {
    /* ... */
  };
  const selectedKeyCapStyle = {
    /* ... */
  };
  const notSelectedkeyCapStyle = {
    /* ... */
  };
  const keyCapStyle = {
    /* ... */
  };

  return (
    <GaesupWorld>
      {/* ... */}
      <KeyBoardToolTip
        keyBoardToolTipInnerStyle={keyBoardToolTipInnerStyle}
        selectedKeyCapStyle={selectedKeyCapStyle}
        notSelectedkeyCapStyle={notSelectedkeyCapStyle}
        keyCapStyle={keyCapStyle}
      />
      {/* ... */}
    </GaesupWorld>
  );
};
```

## 3) minimap

### (1) Info

- 3D 월드 내에서 사용자의 위치와 주변 환경을 작은 지도 형태로 보여주는 리액트 컴포넌트입니다. 이 컴포넌트는 `GaesupWorldContext`를 활용하여 사용자의 현재 상태와 모드에 따라 다르게 렌더링됩니다.

### (2) 특징

- **동적 스케일 조절**: 사용자가 지도의 크기를 동적으로 조절할 수 있습니다.
- **방향 표시**: 동(East), 서(West), 남(South), 북(North) 방향을 시각적으로 표시합니다.
- **커스텀 스타일링**: 미니맵 및 그 내부 요소들의 스타일을 사용자 정의할 수 있습니다.
- **마우스 휠 지원**: 마우스 휠을 사용하여 미니맵의 스케일을 조절할 수 있습니다.

### (3) 사용 방법

1. `MiniMap` 컴포넌트를 컴포넌트 트리에 포함시킵니다.
2. 필요한 스타일을 `minimapStyle`, `innerStyle`, `textStyle`, `objectStyle`, `avatarStyle`, `scaleStyle`, `directionStyle`, `plusMinusStyle` 속성을 통해 전달합니다.
3. 컴포넌트는 현재 사용자의 위치와 방향에 따라 미니맵을 업데이트합니다.

### (4) Example

```jsx
import { MiniMap } from "./MiniMap";

const MyComponent = () => {
  const minimapStyle = {
    /* ... */
  };
  const innerStyle = {
    /* ... */
  };
  // 다른 스타일 속성들도 정의

  return (
    <GaesupWorld>
      {/* ... */}
      <MiniMap
        minimapStyle={minimapStyle}
        innerStyle={innerStyle}
        // 다른 스타일 속성들 전달
      />
      {/* ... */}
    </GaesupWorld>
  );
};
```

## GameBoy

## 개요

- GameBoy 컨트롤러 인터페이스입니다. 게임 4방향 키처럼 사용할 수 있으며, 모바일에서 사용을 권장합니다.

## 특징

- **방향 버튼**: `GameBoyDirections` 배열을 사용하여 방향 입력 (앞으로, 뒤로, 왼쪽으로, 오른쪽으로)을 위한 버튼을 구현합니다.
- **컨텍스트 인식 렌더링**: `GaesupWorldContext`에서 `mode.controller` 값에 따라 컴포넌트를 렌더링합니다.
- **커스텀 스타일링**: 스타일링을 위한 `gameboyStyle` 및 `gameboyButtonStyle` 속성을 받습니다.

## 사용 방법

`GameBoy` 컴포넌트를 사용하기 위해:

1. 컴포넌트 트리에 배치합니다.
2. 필요한 스타일을 `gameboyStyle` 및 `gameboyButtonStyle` 속성을 통해 전달합니다.
3. 컴포넌트는 `GameBoyDirections` 배열에 기반하여 버튼을 렌더링합니다.

## 예제 코드

```jsx
import { GameBoy } from "./GameBoy";
import { GaesupWorldContext } from "../../world/context";

const MyComponent = () => {
  // 커스텀 스타일 정의
  const gameboyStyle = {
    /* ... */
  };
  const gameboyButtonStyle = {
    /* ... */
  };

  return (
    <GameBoy
      gameboyStyle={gameboyStyle}
      gameboyButtonStyle={gameboyButtonStyle}
    />
  );
};
```

## GamePad

## 개요

- 게임패드 컨트롤 인터페이스를 제공하는 커스터마이징 가능한 인터페이스입니다. 조이스틱과 GameBoy와 같은 다양한 컨트롤러 모드에 대응할 수 있는 범용성을 가지고 있습니다.

## 특징

- **동적 버튼 렌더링**: `GaesupWorldContext`의 `control` 객체에 기반하여 버튼을 생성합니다.
- **범용적 사용**: 조이스틱 및 GameBoy와 같은 다양한 컨트롤러 모드와 호환됩니다.
- **커스텀 스타일링**: `gamePadStyle` 및 `gamePadButtonStyle` 속성을 통해 커스텀 스타일링 가능.

## 속성 (Props)

- `gamePadStyle`: 게임패드 컨테이너의 스타일 (`React.CSSProperties` 객체).
- `gamePadButtonStyle`: 개별 버튼의 스타일 (`React.CSSProperties` 객체).
- `label`: 버튼에 대한 커스텀 라벨.

## 사용 방법

1. `GamePad` 컴포넌트를 컴포넌트 트리에 배치합니다.
2. `gamePadStyle` 및 `gamePadButtonStyle`을 사용하여 외관을 커스터마이즈합니다.
3. 컴포넌트는 컨트롤러 모드에 맞춰 적절한 버튼을 렌더링합니다.

## 예제 코드

```tsx
import { GamePad } from "./GamePad";
import { GaesupWorldContext } from "../../world/context";

const MyComponent = () => {
  const gamePadStyle = {
    /* 여기에 커스텀 스타일을 정의하세요 */
  };
  const gamePadButtonStyle = {
    /* 여기에 버튼의 커스텀 스타일을 정의하세요 */
  };

  return (
    <GamePad
      gamePadStyle={gamePadStyle}
      gamePadButtonStyle={gamePadButtonStyle}
    />
  );
};
```

## ZoomButton

## 개요

- 특정 위치로 카메라를 이동시키기 위한 버튼이고 카메라의 zoom 컨트롤을 주로 수행합니다. target에 특정 물체를 넣을 수도 있습니다.

## 속성 (Props)

- `position`: 카메라가 이동할 대상 위치 (`THREE.Vector3` 객체).
- `children`: (선택사항) 버튼 내에 렌더링될 React 노드.
- `target`: (선택사항) 카메라가 바라볼 대상 위치 (`THREE.Vector3` 객체).
- `keepBlocking`: (선택사항) 카메라 이동 중 블로킹 상태를 유지할지 여부.
- `zoomButtonStyle`: (선택사항) 버튼의 스타일 (`React.CSSProperties` 객체).

## 사용 방법

1. `ZoomButton` 컴포넌트를 원하는 위치에 배치합니다.
2. `position` prop을 통해 카메라가 이동할 위치를 지정합니다.
3. 버튼을 클릭하면 지정된 위치로 카메라가 이동합니다.

## 예제 코드

```tsx
import { ZoomButton } from "./ZoomButton";
import * as THREE from "three";

const App = () => {
  return (
    <GaesupWorld>
      {/* ... */}
      <ZoomButton position={new THREE.Vector3(0, 0, 5)}>{children}</ZoomButton>
      {/* ... */}
    </GaesupWorld>
  );
};
```
