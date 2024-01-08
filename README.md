# Gaesup World

[![Version](https://img.shields.io/npm/v/gaesup-world?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/gaesup-world)
[![Downloads](https://img.shields.io/npm/dt/gaesup-world.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/gaesup-world)

### Web 3D Character Controller and World Platform Library
![ezgif-7-177168be04](https://github.com/jigglypop/gaesup-world/assets/52653682/3ac16291-c851-4b0c-9c19-7026a18a00bb)




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

###

- ## [PlayerType](##PlayerType)

  - Character
  - Vehicle
  - Airplane

- Animation

- ### [Tools](#Tools)

  - [JoyStick](#JoyStick)

  * [keyBoardTooltip](#keyBoardTooltip)

  * [minimap](#MiniMap)

  * [gameboy](#GameBoy)

  - [GamePad](#GamePad)

  - [ZoomButton](#ZoomButton)

  - [JumpPortal](#JumpPortal)

# PlayerType

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

- This is the vehicle control in Gaesup World. Characters can board the vehicle.

* Possible Camera Types (only orbit type available)

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

- Rideable objects are objects that can be ridden. They detect collisions and allow the character to board when contact is made. Currently, two types of objects, 'vehicle' and 'airplane', can be ridden.![Rideable](https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/images/rideable.gif)

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

# GaeSupProps

The `GaeSupProps` component is a React component used in a 3D environment. It is designed to represent various types of props or objects within the scene. This component can be used to create props with different types, text labels, and positions for visualization in a 3D space.

## Props

The `GaeSupProps` component accepts the following props:

- `type` (optional): A string specifying the type of the prop. It can be either `"normal"` or `"ground"`. Defaults to `"normal"` if not provided.
- `text` (optional): A string representing the text label associated with the prop. This label can provide additional information about the prop. If not provided, no label will be displayed.
- `position` (optional): An array of three numbers `[x, y, z]` specifying the initial position of the prop in the 3D space. If not provided, the prop will be positioned at the origin `[0, 0, 0]`.
- `children` (required): This prop should contain the 3D content that makes up the visual representation of the prop. It can include any 3D objects or components you want to render within the prop.

### (2) example

- To use the `GaeSupProps` component, you need to import it and include it in your React component tree. Here's an example of how to use it:

```tsx
import { GaeSupProps } from "./GaeSupProps";

function MyScene() {
  return (
    <GaeSupProps type="normal" text="My Prop" position={[3, 1, -2]}>
      {/* 3D content goes here */}
    </GaeSupProps>
  );
}
```

- In this example, we've created a `GaeSupProps` component with a `"normal"` type, a text label of `"My Prop"`, and a specific position in 3D space.

### (3) Behavior

- The `GaeSupProps` component also calculates the size and center of the 3D content it contains. It then updates a `minimap` object with this information, which can be useful for tracking the props within the scene.

- Additionally, the component uses the `useEffect` hook to dispatch updates to the context, ensuring that changes to the `minimap` object are reflected in the sce

# Tools

- Various tools that assist with character control in GaesupWorld

## JoyStick

The JoyStick component provides a virtual joystick interface, primarily intended for mobile environments. This component allows you to simulate joystick-like input on mobile devices. Additionally, you can prevent position jitter, which can occur on mobile devices, by using the `scrollBlock` option in the `GaesupWorld` component.

| Prop Name           | Type            | Required | Description                 | Default Value |
| ------------------- | --------------- | -------- | --------------------------- | ------------- |
| `joyStickBallStyle` | object (styles) | Optional | Style for the joystick ball | `undefined`   |

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

## KeyBoardToolTip

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

```tsx
import { KeyBoardToolTip } from "./KeyBoardToolTip";
import { GaesupWorldContext } from "../../world/context";

const App = () => {
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

## MiniMap

- The MiniMap component is used to display a small map of the user's location and the surrounding environment within a 3D world.

### (1) props

| Prop Name        | Type            | Required | Description                                   | Default Value |
| ---------------- | --------------- | -------- | --------------------------------------------- | ------------- |
| `innerStyle`     | object (styles) | Optional | Style for the inner MiniMap container         | `undefined`   |
| `textStyle`      | object (styles) | Optional | Style for text within the MiniMap             | `undefined`   |
| `objectStyle`    | object (styles) | Optional | Style for objects within the MiniMap          | `undefined`   |
| `avatarStyle`    | object (styles) | Optional | Style for avatars within the MiniMap          | `undefined`   |
| `scaleStyle`     | object (styles) | Optional | Style for the scale control of the MiniMap    | `undefined`   |
| `directionStyle` | object (styles) | Optional | Style for direction indicators in the MiniMap | `undefined`   |
| `plusMinusStyle` | object (styles) | Optional | Style for plus/minus controls in the MiniMap  | `undefined`   |

### 2) example

```tsx
import { MiniMap } from "./MiniMap";

const App = () => {
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

### Key Features:

- **Dynamic Scaling:** Allows users to dynamically adjust the size of the map.
- **Direction Indicators:** Visualizes directions such as East, West, South, and North.
- **Custom Styling:** Allows customization of the MiniMap and its internal elements.
- **Mouse Wheel Support:** Supports adjusting the map's scale using the mouse wheel.

### How to Use:

1. Include the `MiniMap` component within your component tree.
2. Customize the appearance using the `minimapStyle`, `innerStyle`, `textStyle`, `objectStyle`, `avatarStyle`, `scaleStyle`, `directionStyle`, and `plusMinusStyle` properties as needed.
3. The component updates the MiniMap based on the user's current position and direction.

## GameBoy

- The GameBoy component is a controller interface that emulates GameBoy-like directional buttons. It is primarily intended for mobile usage.

### (1) props

| Prop Name            | Type            | Required | Description                          | Default Value |
| -------------------- | --------------- | -------- | ------------------------------------ | ------------- |
| `gamePadStyle`       | object (styles) | Optional | Style for the GamePad container      | `undefined`   |
| `gamePadButtonStyle` | object (styles) | Optional | Style for individual GamePad buttons | `undefined`   |
| `label`              | string          | Optional | Custom label for the buttons         | `undefined`   |

### (2) example

```tsx
import { GameBoy } from "./GameBoy";
import { GaesupWorldContext } from "../../world/context";

const App = () => {
  return (
    <GaesupWorld>
      {/* ... */}
      <GameBoy
        gameboyStyle={gameboyStyle}
        gameboyButtonStyle={gameboyButtonStyle}
      />
      {/* ... */}
    </GaesupWorld>
  );
};
```

### Key Features:

- **Direction Buttons:** Implements buttons for directional input (forward, backward, left, right) based on the `GameBoyDirections` array.
- **Context-aware Rendering:** Renders the component based on the `mode.controller` value from the `GaesupWorldContext`.
- **Custom Styling:** Provides `gameboyStyle` and `gameboyButtonStyle` properties for styling customization.

### How to Use:

To use the `GameBoy` component:

1. Place the `GameBoy` component within your component tree.
2. Customize the appearance by defining styles in the `gameboyStyle` and `gameboyButtonStyle` properties.
3. The component renders buttons based on the `GameBoyDirections` array.

## GamePad

- The GamePad component provides a customizable controller interface that supports various controller modes, such as joysticks and GameBoys, making it versatile for different input scenarios.

### (1) props

| Prop Name            | Type            | Required | Description                          | Default Value |
| -------------------- | --------------- | -------- | ------------------------------------ | ------------- |
| `gamePadStyle`       | object (styles) | Optional | Style for the GamePad container      | `undefined`   |
| `gamePadButtonStyle` | object (styles) | Optional | Style for individual GamePad buttons | `undefined`   |
| `label`              | string          | Optional | Custom label for the buttons         | `undefined`   |

### (2) example

```tsx
import { GamePad } from "./GamePad";
import { GaesupWorldContext } from "../../world/context";

const App = () => {
  return (
    <GaesupWorld>
      {/* ... */}
      <GamePad
        gamePadStyle={gamePadStyle}
        gamePadButtonStyle={gamePadButtonStyle}
      />
      {/* ... */}
    </GaesupWorld>
  );
};
```

### Key Features:

- **Dynamic Button Rendering:** Dynamically generates buttons based on the `control` object in the `GaesupWorldContext`.
- **Universal Usage:** Compatible with various controller modes like joysticks and GameBoys.
- **Custom Styling:** Allows customization of the GamePad's appearance using the `gamePadStyle` and `gamePadButtonStyle` properties.

### How to Use:

1. Include the `GamePad` component within your component tree.
2. Customize the appearance using the `gamePadStyle` and `gamePadButtonStyle` properties.
3. The component dynamically renders buttons based on the `control` mode.

## ZoomButton

- The ZoomButton component is used to move the camera to a specific location and control the camera's zoom, primarily used for zooming to a target.

### (1) props

| Prop Name         | Type            | Required | Description                                                | Default Value |
| ----------------- | --------------- | -------- | ---------------------------------------------------------- | ------------- |
| `position`        | THREE.Vector3   | Required | Target position for the camera to move to                  | None          |
| `children`        | React.ReactNode | Optional | React nodes to render within the button                    | `undefined`   |
| `target`          | THREE.Vector3   | Optional | Target position for the camera to look at                  | `undefined`   |
| `keepBlocking`    | boolean         | Optional | Determines whether to keep blocking while camera is moving | `undefined`   |
| `zoomButtonStyle` | object (styles) | Optional | Style for the ZoomButton component                         | `undefined`   |

### (2) example

```tsx
import { ZoomButton } from "./ZoomButton";
import * as THREE from "three";

const App = () => {
  return (
    <GaesupWorld>
      {/* ... */}
      <ZoomButton position={new THREE.Vector3(0, 0, 5)}>{childern}</ZoomButton>
      {/* ... */}
    </GaesupWorld>
  );
};
```

### (3) How to Use

1. Place the `ZoomButton` component in your component tree at the desired location.
2. Define the `position` prop to specify the location the camera should move to.
3. When the button is clicked, the camera will move to the specified position.

## JumpPortal

- The `JumpPortal` component represents a clickable portal that allows users to teleport to a specified location within a 3D world. This component can be used to create interactive teleportation points in your application.

### (1) props

| Prop Name         | Type          | Required | Description                                                 | Default Value |
| ----------------- | ------------- | -------- | ----------------------------------------------------------- | ------------- |
| `text`            | string        | Optional | The text to display on the portal.                          | `undefined`   |
| `position`        | THREE.Vector3 | Required | The target position to teleport to using a `THREE.Vector3`. | None          |
| `jumpPortalStyle` | CSSProperties | Optional | CSS styles for customizing the appearance of the portal.    | `undefined`   |

### (2) example

- To use the `JumpPortal` component, you can import it and include it in your React application as follows:

```tsx
import { JumpPortal } from "./JumpPortal";
import * as THREE from "three";

const App = () => {
  return (
    <GaesupWorld>
      {/* ... */}
      <JumpPortal
        text="Teleport"
        position={new THREE.Vector3(10, 0, 5)}
        jumpPortalStyle={{ backgroundColor: "blue", color: "white" }}
      />
      {/* ... */}
    </GaesupWorld>
  );
};
```
