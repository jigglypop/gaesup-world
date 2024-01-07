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

### Index

- Player Type

  - Character
  - Vehicle
  - Airplane

- Animation

## Player Type

---

## Character

This is the character control in Gaesup World.

- Possible Camera Types

| Name   | Control       | Info                                                                                          |
| ------ | ------------- | --------------------------------------------------------------------------------------------- |
| Normal | Orbit Control | Positioned parallel to the Z-axis from the character's location and not affected by rotation. |
| Orbit  | Orbit Control | Moves with the character and rotates according to the character's direction.                  |

- Controller Tools

| Name     | Info                                                                    |
| -------- | ----------------------------------------------------------------------- |
| Keyboard | A standard keyboard tool. You can see where on the keyboard is clicked. |
| Joystick | A joystick implementation tool. It works on mobile devices.             |
| Gameboy  | A Gameboy implementation tool. It works on mobile devices.              |

## Vehicle

This is the vehicle control in Gaesup World. Characters can board the vehicle.

- Possible Camera Types (only orbit type available)

| Name  | Control       | Info                                                                         |
| ----- | ------------- | ---------------------------------------------------------------------------- |
| Orbit | Orbit Control | Moves with the character and rotates according to the character's direction. |

- Controller Tools

| Name     | Info                                                                    |
| -------- | ----------------------------------------------------------------------- |
| Keyboard | A standard keyboard tool. You can see where on the keyboard is clicked. |
| Joystick | A joystick implementation tool. It works on mobile devices.             |
| Gameboy  | A Gameboy implementation tool. It works on mobile devices.              |

## Airplane

This is the airplane control in Gaesup World. Characters can board the airplane.

- Possible Camera Types (only orbit type available)

| Name  | Control       | Info                                                                         |
| ----- | ------------- | ---------------------------------------------------------------------------- |
| Orbit | Orbit Control | Moves with the character and rotates according to the character's direction. |

- Controller Tools

| Name     | Info                                                                    |
| -------- | ----------------------------------------------------------------------- |
| Keyboard | A standard keyboard tool. You can see where on the keyboard is clicked. |
| Joystick | A joystick implementation tool. It works on mobile devices.             |
| Gameboy  | A Gameboy implementation tool. It works on mobile devices.              |

---

# Animation

- Animation refers to the method of controlling animations for characters and other elements in the Gaesup World.

# Rideable

- Rideable objects are objects that can be ridden. They detect collisions and allow the character to board when contact is made. Currently, two types of objects, 'vehicle' and 'airplane', can be ridden.

![Rideable](https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/images/rideable.gif)

### (1) Example

```tsx
export default function App() {
  // Define URLs
  const CHARACTER_URL = S3 + "/gaesup.glb";
  const AIRPLANE_URL = S3 + "/air.glb";
  const VEHICLE_URL = S3 + "/kart.glb";
  const WHEEL_URL = S3 + "/wheel.glb";

  return (
    <GaesupWorld
    // ...props defined here
    >
      <Canvas
      // ...props defined here
      >
        <Physics>
          <GaesupController />

          {/* Import Rideable component inside and pass the arguments as shown below */}
          <Rideable
            objectkey="1"
            objectType="vehicle"
            isRiderOn={true}
            url={VEHICLE_URL}
            wheelUrl={WHEEL_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(-10, 5, 10)}
          />
          <Rideable
            objectkey="2"
            objectType="vehicle"
            isRiderOn={false}
            url={VEHICLE_URL}
            wheelUrl={WHEEL_URL}
            position={V3(-20, 5, 10)}
          />
          <Rideable
            objectkey="3"
            objectType="airplane"
            isRiderOn={true}
            url={AIRPLANE_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(10, 5, 10)}
          />
          <Rideable
            objectkey="4"
            objectType="airplane"
            isRiderOn={false}
            url={AIRPLANE_URL}
            position={V3(20, 5, 10)}
          />
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

### 2) Precautions

- The `objectkey` must be unique.

### 3) Props

| Prop Name      | Type                    | Required | Description                                     | Default Value  |
| -------------- | ----------------------- | -------- | ----------------------------------------------- | -------------- |
| `objectkey`    | string                  | Required | Unique identifier for the rideable object       | None           |
| `objectType`   | "vehicle" or "airplane" | Optional | Type of the rideable object                     | `undefined`    |
| `isRiderOn`    | boolean                 | Optional | Whether a rider is on the rideable object       | `false`        |
| `url`          | string                  | Optional | 3D model URL for the rideable object            | `null`         |
| `wheelUrl`     | string                  | Optional | Wheel model URL for "vehicle" type rideables    | `null`         |
| `position`     | THREE.Vector3           | Optional | Initial position of the rideable object         | `(0, 0, 0)`    |
| `rotation`     | THREE.Euler             | Optional | Initial rotation angle of the rideable object   | `(0, 0, 0)`    |
| `offset`       | THREE.Vector3           | Optional | Initial position offset for the rideable object | `(0, 0, 0)`    |
| `visible`      | boolean                 | Optional | Visibility of the rideable object               | `true`         |
| `vehicleSize`  | THREE.Vector3           | Optional | Size of the "vehicle" type rideable object      | Rapier default |
| `wheelSize`    | THREE.Vector3           | Optional | Size of the wheel for "vehicle" type rideables  | Rapier default |
| `airplaneSize` | THREE.Vector3           | Optional | Size of the "airplane" type rideable object     | Rapier default |

### 4) Features

1. **Support for Various Rideable Objects:** The Rideable component can render a variety of rideable objects, including "vehicle" and "airplane" types. It can render the 3D models of each object and allow interactions with them.
2. **Customizable Properties:** You can easily configure the initial state, size, model URLs, visibility, and more of rideable objects using component properties.
3. **Interaction with Riders:** The Rideable component supports interactions required for a rider to board and move with rideable objects.

### Advantages:

1. **Modularity and Reusability:** The Rideable component is modular and can be easily integrated with other components, increasing code reusability and facilitating maintenance.
2. **Rapid Development:** By using the `useRideable` hook, which manages the physics engine and rideable object management, developers can quickly implement and render rideable objects, reducing development time.
3. **Real-time Interaction:** Leveraging the Rapier physics engine allows for real-time handling of rideable object movements and collision checks, providing a high level of interaction in games or simulations.
4. **Flexible Customization:** You can customize the appearance and behavior of each rideable object using properties, making it suitable for various game or simulation environments.

# Tools

- 개숲월드에서 캐릭터 컨트롤을 도와주는 다양한 도구들입니다.

#### 1) [joystick](#1. joyStick)

#### 2) [keyboardtooltip](#keyBoardTooltip)

#### [minimap](#minimap)

#### [gameboy](#gameboy)

## 1. JoyStick

The JoyStick component provides a virtual joystick interface, primarily intended for mobile environments. This component allows you to simulate joystick-like input on mobile devices. Additionally, you can prevent position jitter, which can occur on mobile devices, by using the `scrollBlock` option in the `GaesupWorld` component.

### Key Features:

- **Joystick Interface:** Provides a joystick-like user input interface, suitable for mobile devices.
- **Customization:** You can customize the style of the JoyStick component by adjusting the styles of the joystick and the joystick ball using the `joyStickBallStyle` and `joyStickStyle` properties.
- **Responsive and Interactive:** It supports various input devices and responds to both mouse and mobile touch events for controlling movement.

### Props:

- `joyStickBallStyle`: Style of the joystick ball.

### (5) Example

```jsx
const MyComponent = () => {
  const joyStickStyle = {
    /* joyStickStyle */
  };
  const joyStickBallStyle = {
    /* joyStickBallStyle */
  };

  return (
    <GaesupWorld>
      {/* ... */}
      <JoyStick
        joyStickStyle={joyStickStyle}
        joyStickBallStyle={joyStickBallStyle}
      />
      {/* ... */}
    </GaesupWorld>
  );
};
```

##

## 2. KeyBoardToolTip (키보드 툴팁)

The KeyBoardToolTip component is designed to visually represent a keyboard controller interface, providing a visual representation of each key and its associated action.

### Key Features:

- **Visualizing Keyboard Keys:** Visualizes all keyboard keys in an array format.
- **State Animation:** Reflects the currently active keys and their associated actions by displaying them differently to provide user feedback.
- **Custom Styling:** Provides various styling properties for customizing key caps' appearance.

### How to Use:

1. Include the `KeyBoardToolTip` component within the `GaesupWorld` component.
2. Define the `control` mode as "keyboard" in the `mode` property.
3. The component visualizes each keyboard key based on the `KeyBoardAll` constant and applies different styles for currently active keys.
4. (Optional) Customize the styles using the `keyBoardToolTipInnerStyle`, `selectedKeyCapStyle`, `notSelectedkeyCapStyle`, and `keyCapStyle` properties.

### Example:

```
jsxCopy code
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

## 3. MiniMap

The MiniMap component is used to display a small map of the user's location and the surrounding environment within a 3D world.

### Key Features:

- **Dynamic Scaling:** Allows users to dynamically adjust the size of the map.
- **Direction Indicators:** Visualizes directions such as East, West, South, and North.
- **Custom Styling:** Allows customization of the MiniMap and its internal elements.
- **Mouse Wheel Support:** Supports adjusting the map's scale using the mouse wheel.

### How to Use:

1. Include the `MiniMap` component within your component tree.
2. Customize the appearance using the `minimapStyle`, `innerStyle`, `textStyle`, `objectStyle`, `avatarStyle`, `scaleStyle`, `directionStyle`, and `plusMinusStyle` properties as needed.
3. The component updates the MiniMap based on the user's current position and direction.

### Example:

```tsx
import { MiniMap } from "./MiniMap";

const MyComponent = () => {
  const minimapStyle = {
    /* ... */
  };
  const innerStyle = {
    /* ... */
  };
  // Define other style properties as needed

  return (
    <GaesupWorld>
      {/* ... */}
      <MiniMap
        minimapStyle={minimapStyle}
        innerStyle={innerStyle}
        // Pass other style properties as needed
      />
      {/* ... */}
    </GaesupWorld>
  );
};
```

## 4. GameBoy

- The GameBoy component is a controller interface that emulates GameBoy-like directional buttons. It is primarily intended for mobile usage.

### Key Features:

- **Direction Buttons:** Implements buttons for directional input (forward, backward, left, right) based on the `GameBoyDirections` array.
- **Context-aware Rendering:** Renders the component based on the `mode.controller` value from the `GaesupWorldContext`.
- **Custom Styling:** Provides `gameboyStyle` and `gameboyButtonStyle` properties for styling customization.

### How to Use:

To use the `GameBoy` component:

1. Place the `GameBoy` component within your component tree.
2. Customize the appearance by defining styles in the `gameboyStyle` and `gameboyButtonStyle` properties.
3. The component renders buttons based on the `GameBoyDirections` array.

### Example:

```tsx
import { GameBoy } from "./GameBoy";
import { GaesupWorldContext } from "../../world/context";

const MyComponent = () => {
  // Define custom styles
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

## 5. GamePad

- The GamePad component provides a customizable controller interface that supports various controller modes, such as joysticks and GameBoys, making it versatile for different input scenarios.

### Key Features:

- **Dynamic Button Rendering:** Dynamically generates buttons based on the `control` object in the `GaesupWorldContext`.
- **Universal Usage:** Compatible with various controller modes like joysticks and GameBoys.
- **Custom Styling:** Allows customization of the GamePad's appearance using the `gamePadStyle` and `gamePadButtonStyle` properties.

### Props:

- `gamePadStyle`: Style of the GamePad container (`React.CSSProperties` object).
- `gamePadButtonStyle`: Style of individual buttons (`React.CSSProperties` object).
- `label`: Custom label for the buttons.

### How to Use:

1. Include the `GamePad` component within your component tree.
2. Customize the appearance using the `gamePadStyle` and `gamePadButtonStyle` properties.
3. The component dynamically renders buttons based on the `control` mode.

### Example:

```tsx
jsxCopy code
import { GamePad } from "./GamePad";
import { GaesupWorldContext } from "../../world/context";

const MyComponent = () => {
  const gamePadStyle = {
    /* Define custom styles here */
  };
  const gamePadButtonStyle = {
    /* Define button styles here */
  };

  return (
    <GamePad
      gamePadStyle={gamePadStyle}
      gamePadButtonStyle={gamePadButtonStyle}
    />
  );
};
```

## 6. ZoomButton

The ZoomButton component is used to move the camera to a specific location and control the camera's zoom, primarily used for zooming to a target.

### Key Features:

- `position`: The target position where the camera will move to (`THREE.Vector3` object).
- `children`: (Optional) React nodes to render within the button.
- `target`: (Optional) The target position the camera will look at (`THREE.Vector3` object).
- `keepBlocking`: (Optional) Determines whether to keep the blocking state while the camera is moving.
- `zoomButtonStyle`: (Optional) Style for the button (`React.CSSProperties` object).

### How to Use:

1. Place the `ZoomButton` component in your component tree at the desired location.
2. Define the `position` prop to specify the location the camera should move to.
3. When the button is clicked, the camera will move to the specified position.

### Example:

```tsx
jsxCopy code
import { ZoomButton } from "./ZoomButton";
import * as THREE from "three";

const App = () => {
  return (
    <ZoomButton position={new THREE.Vector3(0, 0, 5)}>
      Zoom to Position
    </ZoomButton>
  );
};
```

##
