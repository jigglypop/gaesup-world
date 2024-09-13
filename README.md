# Gaesup World

[![Version](https://img.shields.io/npm/v/gaesup-world?style=flat-square&logo=npm&logoColor=white&labelColor=000000&color=blue)](https://www.npmjs.com/package/gaesup-world)
[![Downloads](https://img.shields.io/npm/dt/gaesup-world.svg?style=flat-square&logo=npm&logoColor=white&labelColor=000000&color=blue)](https://www.npmjs.com/package/gaesup-world)

![Gaesup World](https://jiggloghttps.s3.ap-northeast-2.amazonaws.com/poster.png)


## Language / 언어

- [English](#english)
- [한국어](#한국어)

---

## English

### Introduction

**Gaesup World** is a comprehensive library designed to facilitate the creation and management of interactive 3D environments on the web. Leveraging powerful tools like `@react-three/fiber`, `@react-three/drei`, and `react-three-rapier`, Gaesup World provides robust control mechanisms for characters, vehicles, airplanes, and more. It offers utilities such as minimaps and joysticks, making it ideal for building immersive virtual worlds and games.

---

### Features

- **3D Character Control**: Control characters in a 3D space using React Three Fiber.
- **Simple API**: Easily manage character movement and animations.
- **Extensible Structure**: Customize and extend functionalities as needed.
- **Lightweight**: Optimized for fast loading and performance.
- **Utilities**: Includes minimaps, joysticks, and more for enhanced user experience.

---

### Installation

#### Using npm

```bash
npm install @react-three/fiber @react-three/drei three @types/three @react-three/rapier ../../../src
```

#### Using yarn

```bash
yarn add @react-three/fiber @react-three/drei three @types/three @react-three/rapier ../../../src
```

---

### How to Start

Here's a simple example to get you started with **Gaesup World**:

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController } from '../../../src';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard', // or 'joystick', 'gamepad', etc.
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

In this example, the **GaesupWorld** component sets up the 3D environment, and the **GaesupController** manages character control. The `url` prop specifies the 3D model URL for the character, and the `mode` prop defines the type of controller to use.

---

### Components

**Gaesup World** offers a variety of components to manage characters and interactive objects within the 3D environment. Below are the key components:

#### PlayerType

**PlayerType** defines various controllable player types in Gaesup World. Currently supported types include **Character**, **Vehicle**, and **Airplane**.

##### Character

The **Character** component handles character movement, animation, and interactions within Gaesup World.

- **Camera Types**:
  - **Normal**: Positioned parallel to the Z-axis from the character's location and not affected by rotation.
  - **Orbit**: Moves with the character and rotates according to the character's direction.

- **Controller Tools**:
  - **Keyboard**: Standard keyboard input for desktop environments.
  - **Joystick**: Joystick input for mobile devices.
  - **GameBoy**: GameBoy-style button input for mobile devices.

###### Usage Example

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController } from '../../../src';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard', // or 'joystick', 'gamepad', etc.
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

---

##### Vehicle

The **Vehicle** component manages vehicle movement, animation, and interactions within Gaesup World. Characters can board and control vehicles.

- **Camera Types**:
  - **Orbit Control**: Moves with the character and rotates according to the character's direction.

- **Controller Tools**:
  - **Keyboard**: Standard keyboard input for desktop environments.
  - **Joystick**: Joystick input for mobile devices.
  - **GameBoy**: GameBoy-style button input for mobile devices.

###### Usage Example

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController, Rideable } from '../../../src';
import { V3 } from '../../../src/utils';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';
  const VEHICLE_URL = 'https://your-s3-bucket/kart.glb';
  const WHEEL_URL = 'https://your-s3-bucket/wheel.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard',
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />

          <Rideable
            objectkey="vehicle1"
            objectType="vehicle"
            isRiderOn={true}
            url={VEHICLE_URL}
            wheelUrl={WHEEL_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(-10, 5, 10)}
          />
          {/* Add more Vehicle components as needed */}
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

---

##### Airplane

The **Airplane** component manages airplane movement, animation, and interactions within Gaesup World. Characters can board and control airplanes.

- **Camera Types**:
  - **Orbit Control**: Moves with the character and rotates according to the character's direction.

- **Controller Tools**:
  - **Keyboard**: Standard keyboard input for desktop environments.
  - **Joystick**: Joystick input for mobile devices.
  - **GameBoy**: GameBoy-style button input for mobile devices.

###### Usage Example

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController, Rideable } from '../../../src';
import { V3 } from '../../../src/utils';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';
  const AIRPLANE_URL = 'https://your-s3-bucket/air.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard',
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />

          <Rideable
            objectkey="airplane1"
            objectType="airplane"
            isRiderOn={true}
            url={AIRPLANE_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(10, 5, 10)}
          />
          {/* Add more Airplane components as needed */}
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

---

#### Animation

The **Animation** component manages animations for characters and other elements within Gaesup World. It allows defining various animation states and triggering animations based on conditions.

- **Key Features**:
  - **Animation State Management**: Manage multiple animation states and trigger animations based on specific conditions.
  - **Conditional Animations**: Automatically switch animations when certain conditions are met.
  - **Extensible Animation System**: Easily add custom animations as needed.

---

#### Rideable

The **Rideable** component defines objects that characters can ride, such as vehicles and airplanes. It detects collisions and allows characters to board when contact is made.

- **Key Features**:
  - **Support for Various Rideable Objects**: Currently supports "vehicle" and "airplane" types.
  - **Customizable Properties**: Easily configure initial state, size, model URLs, visibility, and more.
  - **Interaction with Riders**: Manages interactions required for a rider to board and move with rideable objects.

##### Usage Example

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController, Rideable } from '../../../src';
import { V3 } from '../../../src/utils';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';
  const VEHICLE_URL = 'https://your-s3-bucket/kart.glb';
  const WHEEL_URL = 'https://your-s3-bucket/wheel.glb';
  const AIRPLANE_URL = 'https://your-s3-bucket/air.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard',
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />

          <Rideable
            objectkey="vehicle1"
            objectType="vehicle"
            isRiderOn={true}
            url={VEHICLE_URL}
            wheelUrl={WHEEL_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(-10, 5, 10)}
          />
          <Rideable
            objectkey="vehicle2"
            objectType="vehicle"
            isRiderOn={false}
            url={VEHICLE_URL}
            wheelUrl={WHEEL_URL}
            position={V3(-20, 5, 10)}
          />
          <Rideable
            objectkey="airplane1"
            objectType="airplane"
            isRiderOn={true}
            url={AIRPLANE_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(10, 5, 10)}
          />
          <Rideable
            objectkey="airplane2"
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

**Important Notes**:

- The `objectkey` must be unique for each Rideable component.
- `objectType` should be either `"vehicle"` or `"airplane"`.

##### Props Description

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

---

#### Passive

The **Passive** component defines objects that do not require interaction, such as buildings or other static objects within the environment.

- **Key Features**:
  - **Static Object Management**: Efficiently manages static environment objects.
  - **Performance Optimization**: Optimizes rendering of static objects to enhance overall performance.
  - **Customizable Appearance**: Easily configure the appearance and position of static objects.

---

### Tools

**Gaesup World** includes various utility components to enhance user interaction and experience within the 3D environment.

#### Joystick

- **Description**: Provides a virtual joystick interface primarily intended for mobile environments. Prevents position jitter on mobile devices using the `scrollBlock` option in the **GaesupWorld** component.

- **Props**:

  | Prop Name           | Type            | Required | Description                 | Default Value |
  | ------------------- | --------------- | -------- | --------------------------- | ------------- |
  | `joystickStyle`     | object (styles) | Optional | Style for the joystick      | `undefined`   |
  | `joystickBallStyle` | object (styles) | Optional | Style for the joystick ball | `undefined`   |

- **Usage Example**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, Joystick } from '../../../src';

  export default function App() {
    const joystickStyle = {
      /* Define joystick container styles */
    };
    const joystickBallStyle = {
      /* Define joystick ball styles */
    };

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'joystick', // or 'keyboard', 'gamepad', etc.
          scrollBlock: true, // Prevent position jitter
        }}
      >
        <Canvas>
          <Physics>
            <Joystick
              joystickStyle={joystickStyle}
              joystickBallStyle={joystickBallStyle}
            />
            {/* Other components */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **Key Features**:
  - **Joystick Interface**: Simulates joystick input for mobile devices.
  - **Customization**: Customize the appearance using `joystickStyle` and `joystickBallStyle`.
  - **Responsive Interaction**: Responds to both mouse and touch events for controlling movement.

---

#### KeyBoardTooltip

- **Description**: Visually represents a keyboard controller interface, displaying each key and its associated action.

- **Key Features**:
  - **Visualizing Keyboard Keys**: Displays all keyboard keys in an array format.
  - **State Animation**: Highlights active keys to provide user feedback.
  - **Custom Styling**: Customize keycaps' appearance using various style properties.

- **Usage Example**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, KeyBoardToolTip } from '../../../src';

  export default function App() {
    const keyBoardToolTipInnerStyle = {
      /* Define inner tooltip styles */
    };
    const selectedKeyCapStyle = {
      /* Define styles for selected keycaps */
    };
    const notSelectedkeyCapStyle = {
      /* Define styles for non-selected keycaps */
    };
    const keyCapStyle = {
      /* Define default keycap styles */
    };

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'keyboard', // Ensure controller mode is set to 'keyboard'
        }}
      >
        <Canvas>
          <Physics>
            <KeyBoardToolTip
              keyBoardToolTipInnerStyle={keyBoardToolTipInnerStyle}
              selectedKeyCapStyle={selectedKeyCapStyle}
              notSelectedkeyCapStyle={notSelectedkeyCapStyle}
              keyCapStyle={keyCapStyle}
            />
            {/* Other components */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

---

#### MiniMap

- **Description**: Displays a small map indicating the user's location and the surrounding environment within the 3D world.

- **Props**:

  | Prop Name        | Type            | Required | Description                                   | Default Value |
  | ---------------- | --------------- | -------- | --------------------------------------------- | ------------- |
  | `minimapStyle`   | object (styles) | Optional | Style for the MiniMap container               | `undefined`   |
  | `innerStyle`     | object (styles) | Optional | Style for the inner MiniMap container         | `undefined`   |
  | `textStyle`      | object (styles) | Optional | Style for text within the MiniMap             | `undefined`   |
  | `objectStyle`    | object (styles) | Optional | Style for objects within the MiniMap          | `undefined`   |
  | `avatarStyle`    | object (styles) | Optional | Style for avatars within the MiniMap          | `undefined`   |
  | `scaleStyle`     | object (styles) | Optional | Style for the scale control of the MiniMap    | `undefined`   |
  | `directionStyle` | object (styles) | Optional | Style for direction indicators in the MiniMap | `undefined`   |
  | `plusMinusStyle` | object (styles) | Optional | Style for plus/minus controls in the MiniMap  | `undefined`   |

- **Usage Example**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, MiniMap } from '../../../src';

  export default function App() {
    const minimapStyle = {
      /* Define MiniMap container styles */
    };
    const innerStyle = {
      /* Define inner MiniMap styles */
    };
    // Define other style properties as needed

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'keyboard',
        }}
      >
        <Canvas>
          <Physics>
            <MiniMap
              minimapStyle={minimapStyle}
              innerStyle={innerStyle}
              // Pass other style properties as needed
            />
            {/* Other components */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **Key Features**:
  - **Dynamic Scaling**: Users can adjust the size of the MiniMap.
  - **Direction Indicators**: Displays directions like East, West, South, and North.
  - **Custom Styling**: Customize the appearance of the MiniMap and its elements.
  - **Mouse Wheel Support**: Adjust the MiniMap's scale using the mouse wheel.

---

#### GameBoy

- **Description**: Emulates GameBoy-style directional buttons for mobile environments, providing an intuitive control interface.

- **Props**:

  | Prop Name            | Type            | Required | Description                          | Default Value |
  | -------------------- | --------------- | -------- | ------------------------------------ | ------------- |
  | `gamePadStyle`       | object (styles) | Optional | Style for the GamePad container      | `undefined`   |
  | `gamePadButtonStyle` | object (styles) | Optional | Style for individual GamePad buttons | `undefined`   |
  | `label`              | string          | Optional | Custom label for the buttons         | `undefined`   |

- **Usage Example**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, GameBoy } from '../../../src';

  export default function App() {
    const gamePadStyle = {
      /* Define GamePad container styles */
    };
    const gamePadButtonStyle = {
      /* Define GamePad button styles */
    };

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'gameboy', // Ensure controller mode is set to 'gameboy'
        }}
      >
        <Canvas>
          <Physics>
            <GameBoy
              gamePadStyle={gamePadStyle}
              gamePadButtonStyle={gamePadButtonStyle}
            />
            {/* Other components */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **Key Features**:
  - **Direction Buttons**: Implements buttons for directional input (forward, backward, left, right).
  - **Context-aware Rendering**: Renders based on the `mode.controller` value from the **GaesupWorldContext**.
  - **Custom Styling**: Allows customization of the GamePad's appearance using `gamePadStyle` and `gamePadButtonStyle`.

---

#### GamePad

- **Description**: Provides a customizable controller interface supporting various controller modes, such as joysticks and GameBoys, offering versatility for different input scenarios.

- **Props**:

  | Prop Name            | Type            | Required | Description                          | Default Value |
  | -------------------- | --------------- | -------- | ------------------------------------ | ------------- |
  | `gamePadStyle`       | object (styles) | Optional | Style for the GamePad container      | `undefined`   |
  | `gamePadButtonStyle` | object (styles) | Optional | Style for individual GamePad buttons | `undefined`   |
  | `label`              | string          | Optional | Custom label for the buttons         | `undefined`   |

- **Usage Example**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, GamePad } from '../../../src';

  export default function App() {
    const gamePadStyle = {
      /* Define GamePad container styles */
    };
    const gamePadButtonStyle = {
      /* Define GamePad button styles */
    };

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'gamepad', // or 'joystick', 'gameboy', etc.
        }}
      >
        <Canvas>
          <Physics>
            <GamePad
              gamePadStyle={gamePadStyle}
              gamePadButtonStyle={gamePadButtonStyle}
            />
            {/* Other components */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **Key Features**:
  - **Dynamic Button Rendering**: Generates buttons based on the `control` object from **GaesupWorldContext**.
  - **Universal Usage**: Compatible with various controller modes like joysticks and GameBoys.
  - **Custom Styling**: Customize the appearance using `gamePadStyle` and `gamePadButtonStyle`.

---

#### ZoomButton

- **Description**: Moves the camera to a specific location and controls the camera's zoom, primarily used for zooming to a target.

- **Props**:

  | Prop Name         | Type            | Required | Description                                                | Default Value |
  | ----------------- | --------------- | -------- | ---------------------------------------------------------- | ------------- |
  | `position`        | THREE.Vector3   | Required | Target position for the camera to move to                  | None          |
  | `children`        | React.ReactNode | Optional | React nodes to render within the button                    | `undefined`   |
  | `target`          | THREE.Vector3   | Optional | Target position for the camera to look at                  | `undefined`   |
  | `keepBlocking`    | boolean         | Optional | Determines whether to keep blocking while camera is moving | `undefined`   |
  | `zoomButtonStyle` | object (styles) | Optional | Style for the ZoomButton component                         | `undefined`   |

- **Usage Example**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, ZoomButton } from '../../../src';
  import * as THREE from 'three';

  export default function App() {
    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'keyboard',
        }}
      >
        <Canvas>
          <Physics>
            <ZoomButton
              position={new THREE.Vector3(0, 0, 5)}
              target={new THREE.Vector3(0, 0, 0)}
              zoomButtonStyle={{ backgroundColor: 'blue', color: 'white' }}
            >
              Zoom In
            </ZoomButton>
            {/* Other components */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **Key Features**:
  - **Camera Movement**: Moves the camera to the specified position upon button click.
  - **Zoom Control**: Adjusts the camera's zoom level.
  - **Custom Styling**: Customize the button's appearance using `zoomButtonStyle`.

---

#### JumpPortal

- **Description**: Represents a clickable portal that allows users to teleport to a specified location within the 3D world. Ideal for creating interactive teleportation points in your application.

- **Props**:

  | Prop Name         | Type          | Required | Description                                                 | Default Value |
  | ----------------- | ------------- | -------- | ----------------------------------------------------------- | ------------- |
  | `text`            | string        | Optional | The text to display on the portal.                          | `undefined`   |
  | `position`        | THREE.Vector3 | Required | The target position to teleport to using a `THREE.Vector3`. | None          |
  | `jumpPortalStyle` | CSSProperties | Optional | CSS styles for customizing the appearance of the portal.    | `undefined`   |

- **Usage Example**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, JumpPortal } from '../../../src';
  import * as THREE from 'three';

  export default function App() {
    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'keyboard',
        }}
      >
        <Canvas>
          <Physics>
            <JumpPortal
              text="Teleport"
              position={new THREE.Vector3(10, 0, 5)}
              jumpPortalStyle={{ backgroundColor: "blue", color: "white" }}
            />
            {/* Other components */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **Key Features**:
  - **Teleport Functionality**: Moves the camera and character to the specified position upon clicking the portal.
  - **Custom Styling**: Customize the portal's appearance using `jumpPortalStyle`.
  - **Text Display**: Displays text on the portal to guide users.

---

## How to Contribute

If you would like to contribute to **Gaesup World**, please follow these steps:

1. **Fork the Project**: Click the "Fork" button on GitHub to create your own copy of the repository.
2. **Switch to the Development Branch**: Navigate to the `dev` branch.

   ```bash
   git checkout dev
   ```

3. **Commit Your Changes**: Make your changes and commit them with a descriptive message.

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the Branch**: Push your changes to your forked repository.

   ```bash
   git push origin dev
   ```

5. **Create a Pull Request**: Go to your forked repository on GitHub and create a Pull Request to the original repository's `dev` branch.

---

## License

This project is distributed under the MIT License. For more details, please refer to the [LICENSE](./LICENSE) file.

---

## Additional Information

**Gaesup World** is continuously updated and improved based on user feedback. For more information or assistance, feel free to reach out via the [GitHub Issues](https://github.com/jigglypop/../../../src/issues) page.

---

**Build immersive web 3D environments with Gaesup World!**

## 한국어

### 소개

**Gaesup World**는 웹에서 상호작용 가능한 3D 환경을 손쉽게 생성하고 관리할 수 있도록 설계된 종합적인 라이브러리입니다. `@react-three/fiber`, `@react-three/drei`, `react-three-rapier`와 같은 강력한 도구를 활용하여 캐릭터, 비행기, 차량 등 다양한 객체의 제어 메커니즘을 제공합니다. 미니맵, 조이스틱과 같은 유틸리티를 통해 몰입감 있는 가상 세계와 게임을 구축하는 데 이상적입니다.

---

### 특징

- **3D 캐릭터 컨트롤**: React Three Fiber를 사용하여 3D 공간에서 캐릭터를 제어합니다.
- **간편한 API**: 캐릭터의 이동과 애니메이션을 쉽게 관리할 수 있는 간단한 API 제공.
- **확장 가능한 구조**: 필요에 따라 기능을 커스터마이징하고 확장할 수 있습니다.
- **경량화**: 빠른 로딩과 성능 최적화를 위해 경량화 설계.
- **유틸리티**: 미니맵, 조이스틱 등 사용자 경험을 향상시키는 다양한 유틸리티 포함.

---

### 설치 방법

#### npm을 이용한 설치

```bash
npm install @react-three/fiber @react-three/drei three @types/three @react-three/rapier ../../../src
```

#### yarn을 이용한 설치

```bash
yarn add @react-three/fiber @react-three/drei three @types/three @react-three/rapier ../../../src
```

---

### 시작하기

다음은 **Gaesup World**의 기본 사용법을 소개하는 간단한 예제입니다:

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController } from '../../../src';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard', // 또는 'joystick', 'gamepad' 등
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

위 예제에서는 **GaesupWorld** 컴포넌트를 통해 3D 환경을 설정하고, **GaesupController**를 이용하여 캐릭터를 제어합니다. `url` prop을 통해 캐릭터의 3D 모델 URL을 지정하고, `mode` prop을 통해 사용하고자 하는 컨트롤러 타입을 설정합니다.

---

### 컴포넌트

**Gaesup World**는 다양한 컴포넌트를 제공하여 캐릭터와 객체의 제어, 상호작용을 지원합니다. 주요 컴포넌트는 다음과 같습니다.

#### PlayerType

**PlayerType**은 Gaesup World에서 제어할 수 있는 다양한 플레이어 타입을 정의합니다. 현재 지원되는 타입은 **Character**, **Vehicle**, **Airplane**입니다.

##### Character

**Character** 컴포넌트는 Gaesup World 내에서 캐릭터의 이동, 애니메이션, 상호작용을 관리하는 핵심 컴포넌트입니다.

- **카메라 타입**:
  - **Normal**: 캐릭터의 위치를 기준으로 Z축에 평행하게 배치되며, 캐릭터의 회전에 영향을 받지 않습니다.
  - **Orbit**: 캐릭터와 함께 움직이며 캐릭터의 방향에 따라 카메라가 회전합니다.

- **컨트롤러 도구**:
  - **Keyboard**: 데스크탑 환경에서 표준 키보드 입력을 통해 캐릭터를 제어합니다.
  - **Joystick**: 모바일 환경에서 조이스틱 입력을 통해 캐릭터를 제어합니다.
  - **GameBoy**: 모바일 환경에서 GameBoy 스타일의 버튼 입력을 통해 캐릭터를 제어합니다.

###### 사용 예제

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController } from '../../../src';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard', // 또는 'joystick', 'gamepad' 등
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

---

##### Vehicle

**Vehicle** 컴포넌트는 Gaesup World 내에서 차량의 이동, 애니메이션, 상호작용을 관리합니다. 캐릭터가 차량에 탑승할 수 있습니다.

- **카메라 타입**:
  - **Orbit Control**: 캐릭터와 함께 움직이며 캐릭터의 방향에 따라 카메라가 회전합니다.

- **컨트롤러 도구**:
  - **Keyboard**: 데스크탑 환경에서 표준 키보드 입력을 통해 차량을 제어합니다.
  - **Joystick**: 모바일 환경에서 조이스틱 입력을 통해 차량을 제어합니다.
  - **GameBoy**: 모바일 환경에서 GameBoy 스타일의 버튼 입력을 통해 차량을 제어합니다.

###### 사용 예제

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController, Rideable } from '../../../src';
import { V3 } from '../../../src/utils';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';
  const VEHICLE_URL = 'https://your-s3-bucket/kart.glb';
  const WHEEL_URL = 'https://your-s3-bucket/wheel.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard',
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />

          <Rideable
            objectkey="vehicle1"
            objectType="vehicle"
            isRiderOn={true}
            url={VEHICLE_URL}
            wheelUrl={WHEEL_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(-10, 5, 10)}
          />
          {/* 추가적인 Vehicle 컴포넌트 */}
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

---

##### Airplane

**Airplane** 컴포넌트는 Gaesup World 내에서 비행기의 이동, 애니메이션, 상호작용을 관리합니다. 캐릭터가 비행기에 탑승할 수 있습니다.

- **카메라 타입**:
  - **Orbit Control**: 캐릭터와 함께 움직이며 캐릭터의 방향에 따라 카메라가 회전합니다.

- **컨트롤러 도구**:
  - **Keyboard**: 데스크탑 환경에서 표준 키보드 입력을 통해 비행기를 제어합니다.
  - **Joystick**: 모바일 환경에서 조이스틱 입력을 통해 비행기를 제어합니다.
  - **GameBoy**: 모바일 환경에서 GameBoy 스타일의 버튼 입력을 통해 비행기를 제어합니다.

###### 사용 예제

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController, Rideable } from '../../../src';
import { V3 } from '../../../src/utils';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';
  const AIRPLANE_URL = 'https://your-s3-bucket/air.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard',
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />

          <Rideable
            objectkey="airplane1"
            objectType="airplane"
            isRiderOn={true}
            url={AIRPLANE_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(10, 5, 10)}
          />
          {/* 추가적인 Airplane 컴포넌트 */}
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}
```

---

#### Animation

**Animation** 컴포넌트는 캐릭터와 기타 객체의 애니메이션을 관리하는 메서드를 제공합니다. 다양한 애니메이션 상태를 정의하고, 조건에 따라 애니메이션을 트리거할 수 있습니다.

- **주요 기능**:
  - **애니메이션 상태 관리**: 여러 애니메이션 상태를 관리하고, 현재 상태를 트리거합니다.
  - **조건부 애니메이션**: 특정 조건에 따라 애니메이션을 자동으로 전환합니다.
  - **확장 가능한 애니메이션 시스템**: 사용자 정의 애니메이션을 쉽게 추가할 수 있습니다.

---

#### Rideable

**Rideable** 컴포넌트는 캐릭터가 탑승할 수 있는 객체를 정의합니다. 이 컴포넌트는 충돌을 감지하여 캐릭터가 객체에 탑승할 수 있도록 합니다.

- **주요 기능**:
  - **탑승 가능 객체 지원**: 현재 "vehicle"과 "airplane" 타입의 객체를 지원합니다.
  - **커스터마이징 가능한 속성**: 객체의 위치, 회전, 모델 URL 등을 쉽게 설정할 수 있습니다.
  - **상호작용 관리**: 캐릭터와 객체 간의 상호작용을 관리하여 자연스러운 탑승 경험을 제공합니다.

##### 사용 예제

```tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController, Rideable } from '../../../src';
import { V3 } from '../../../src/utils';

export default function App() {
  const CHARACTER_URL = 'https://your-s3-bucket/gaesupyee.glb';
  const VEHICLE_URL = 'https://your-s3-bucket/kart.glb';
  const WHEEL_URL = 'https://your-s3-bucket/wheel.glb';
  const AIRPLANE_URL = 'https://your-s3-bucket/air.glb';

  return (
    <GaesupWorld
      url={{
        characterUrl: CHARACTER_URL,
      }}
      mode={{
        controller: 'keyboard',
      }}
    >
      <Canvas>
        <Physics>
          <GaesupController />

          <Rideable
            objectkey="vehicle1"
            objectType="vehicle"
            isRiderOn={true}
            url={VEHICLE_URL}
            wheelUrl={WHEEL_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(-10, 5, 10)}
          />
          <Rideable
            objectkey="vehicle2"
            objectType="vehicle"
            isRiderOn={false}
            url={VEHICLE_URL}
            wheelUrl={WHEEL_URL}
            position={V3(-20, 5, 10)}
          />
          <Rideable
            objectkey="airplane1"
            objectType="airplane"
            isRiderOn={true}
            url={AIRPLANE_URL}
            offset={V3(0, 0.5, 0)}
            position={V3(10, 5, 10)}
          />
          <Rideable
            objectkey="airplane2"
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

**중요 사항**:

- `objectkey`는 각 Rideable 컴포넌트마다 고유해야 합니다.
- `objectType`은 `"vehicle"` 또는 `"airplane"`이어야 합니다.

##### Props 설명

| Prop Name      | Type                    | Required | Description                         | Default Value |
| -------------- | ----------------------- | -------- | ----------------------------------- | ------------- |
| `objectkey`    | string                  | Required | 탑승 가능한 객체의 고유 식별자      | None          |
| `objectType`   | "vehicle" or "airplane" | Optional | 탑승 가능한 객체의 타입             | `undefined`   |
| `isRiderOn`    | boolean                 | Optional | 객체에 탑승 중인지 여부             | `false`       |
| `url`          | string                  | Optional | 탑승 가능한 객체의 3D 모델 URL      | `null`        |
| `wheelUrl`     | string                  | Optional | `"vehicle"` 타입 객체의 휠 모델 URL | `null`        |
| `position`     | THREE.Vector3           | Optional | 객체의 초기 위치                    | `(0, 0, 0)`   |
| `rotation`     | THREE.Euler             | Optional | 객체의 초기 회전 각도               | `(0, 0, 0)`   |
| `offset`       | THREE.Vector3           | Optional | 객체의 위치 오프셋                  | `(0, 0, 0)`   |
| `visible`      | boolean                 | Optional | 객체의 가시성                       | `true`        |
| `vehicleSize`  | THREE.Vector3           | Optional | `"vehicle"` 타입 객체의 크기        | Rapier 기본값 |
| `wheelSize`    | THREE.Vector3           | Optional | `"vehicle"` 타입 휠의 크기          | Rapier 기본값 |
| `airplaneSize` | THREE.Vector3           | Optional | `"airplane"` 타입 객체의 크기       | Rapier 기본값 |

---

#### Passive

**Passive** 컴포넌트는 상호작용이 필요 없는 객체를 정의합니다. 예를 들어, 주변 환경을 구성하는 건물이나 기타 정적 객체 등을 나타냅니다.

- **주요 기능**:
  - **정적 객체 관리**: 상호작용이 필요 없는 환경 객체를 효율적으로 관리합니다.
  - **성능 최적화**: 정적 객체의 렌더링을 최적화하여 전체적인 성능을 향상시킵니다.
  - **커스터마이징**: 다양한 정적 객체의 외관과 위치를 쉽게 설정할 수 있습니다.

---

### Tools

**Gaesup World**는 다양한 도구 컴포넌트를 제공하여 사용자 인터페이스를 향상시키고, 사용자 경험을 극대화합니다.

#### Joystick

- **설명**: 모바일 환경에서 조이스틱 입력을 시뮬레이션하는 컴포넌트입니다. 스크롤 블록 옵션을 사용하여 모바일 장치에서 위치 지터를 방지할 수 있습니다.
  
- **Props**:

  | Prop Name           | Type            | Required | Description              | Default Value |
  | ------------------- | --------------- | -------- | ------------------------ | ------------- |
  | `joystickStyle`     | object (styles) | Optional | 조이스틱 컨테이너 스타일 | `undefined`   |
  | `joystickBallStyle` | object (styles) | Optional | 조이스틱 볼 스타일       | `undefined`   |

- **사용 예제**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, Joystick } from '../../../src';

  export default function App() {
    const joystickStyle = {
      /* 조이스틱 컨테이너 스타일 정의 */
    };
    const joystickBallStyle = {
      /* 조이스틱 볼 스타일 정의 */
    };

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'joystick', // 또는 'keyboard', 'gamepad' 등
          scrollBlock: true, // 모바일 장치에서 위치 지터 방지
        }}
      >
        <Canvas>
          <Physics>
            <Joystick
              joystickStyle={joystickStyle}
              joystickBallStyle={joystickBallStyle}
            />
            {/* 다른 컴포넌트 */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **주요 기능**:
  - **조이스틱 인터페이스**: 모바일 장치에서 자연스러운 조이스틱 입력을 제공합니다.
  - **커스터마이징**: `joystickStyle`과 `joystickBallStyle`을 통해 외관을 자유롭게 커스터마이징할 수 있습니다.
  - **반응형 인터랙션**: 터치 이벤트에 반응하여 캐릭터 움직임을 제어합니다.

---

#### KeyBoardTooltip

- **설명**: 키보드 컨트롤러 인터페이스를 시각적으로 표현하는 컴포넌트로, 각 키의 동작을 시각적으로 표시합니다.
  
- **주요 기능**:
  - **키보드 키 시각화**: 모든 키보드 키를 배열 형식으로 시각화합니다.
  - **상태 애니메이션**: 현재 활성화된 키와 관련 동작을 다르게 표시하여 사용자 피드백을 제공합니다.
  - **커스터마이징**: 키 캡의 외관을 커스터마이징할 수 있는 다양한 스타일 속성을 제공합니다.

- **사용 예제**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, KeyBoardToolTip } from '../../../src';

  export default function App() {
    const keyBoardToolTipInnerStyle = {
      /* 내부 툴팁 스타일 정의 */
    };
    const selectedKeyCapStyle = {
      /* 선택된 키 스타일 정의 */
    };
    const notSelectedkeyCapStyle = {
      /* 선택되지 않은 키 스타일 정의 */
    };
    const keyCapStyle = {
      /* 키 캡 기본 스타일 정의 */
    };

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'keyboard', // 컨트롤러 모드를 'keyboard'로 설정
        }}
      >
        <Canvas>
          <Physics>
            <KeyBoardToolTip
              keyBoardToolTipInnerStyle={keyBoardToolTipInnerStyle}
              selectedKeyCapStyle={selectedKeyCapStyle}
              notSelectedkeyCapStyle={notSelectedkeyCapStyle}
              keyCapStyle={keyCapStyle}
            />
            {/* 다른 컴포넌트 */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

---

#### MiniMap

- **설명**: 사용자의 위치와 주변 환경을 3D 세계 내에 작은 지도 형태로 표시하는 컴포넌트입니다.
  
- **Props**:

  | Prop Name        | Type            | Required | Description                            | Default Value |
  | ---------------- | --------------- | -------- | -------------------------------------- | ------------- |
  | `minimapStyle`   | object (styles) | Optional | 미니맵의 전체 스타일                   | `undefined`   |
  | `innerStyle`     | object (styles) | Optional | 미니맵 내부 컨테이너 스타일            | `undefined`   |
  | `textStyle`      | object (styles) | Optional | 미니맵 내 텍스트 스타일                | `undefined`   |
  | `objectStyle`    | object (styles) | Optional | 미니맵 내 객체 스타일                  | `undefined`   |
  | `avatarStyle`    | object (styles) | Optional | 미니맵 내 아바타 스타일                | `undefined`   |
  | `scaleStyle`     | object (styles) | Optional | 미니맵의 스케일 컨트롤 스타일          | `undefined`   |
  | `directionStyle` | object (styles) | Optional | 미니맵 내 방향 표시 스타일             | `undefined`   |
  | `plusMinusStyle` | object (styles) | Optional | 미니맵의 플러스/마이너스 컨트롤 스타일 | `undefined`   |

- **사용 예제**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, MiniMap } from '../../../src';

  export default function App() {
    const minimapStyle = {
      /* 미니맵 스타일 정의 */
    };
    const innerStyle = {
      /* 내부 스타일 정의 */
    };
    // 기타 스타일 속성 정의

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'keyboard',
        }}
      >
        <Canvas>
          <Physics>
            <MiniMap
              minimapStyle={minimapStyle}
              innerStyle={innerStyle}
              // 기타 스타일 속성 전달
            />
            {/* 다른 컴포넌트 */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **주요 기능**:
  - **동적 스케일링**: 사용자가 미니맵의 크기를 동적으로 조절할 수 있습니다.
  - **방향 표시기**: 동, 서, 남, 북 방향을 시각적으로 표시합니다.
  - **커스터마이징**: 미니맵 및 내부 요소들의 외관을 다양한 스타일 속성을 통해 커스터마이징할 수 있습니다.
  - **마우스 휠 지원**: 마우스 휠을 사용하여 미니맵의 스케일을 조절할 수 있습니다.

---

#### GameBoy

- **설명**: 모바일 환경을 위한 GameBoy 스타일의 방향 버튼을 모방한 컨트롤러 인터페이스입니다.
  
- **Props**:

  | Prop Name            | Type            | Required | Description               | Default Value |
  | -------------------- | --------------- | -------- | ------------------------- | ------------- |
  | `gamePadStyle`       | object (styles) | Optional | GamePad 컨테이너 스타일   | `undefined`   |
  | `gamePadButtonStyle` | object (styles) | Optional | 개별 GamePad 버튼 스타일  | `undefined`   |
  | `label`              | string          | Optional | 버튼에 대한 커스텀 레이블 | `undefined`   |

- **사용 예제**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, GameBoy } from '../../../src';

  export default function App() {
    const gamePadStyle = {
      /* GamePad 컨테이너 스타일 정의 */
    };
    const gamePadButtonStyle = {
      /* GamePad 버튼 스타일 정의 */
    };

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'gameboy', // 컨트롤러 모드를 'gameboy'로 설정
        }}
      >
        <Canvas>
          <Physics>
            <GameBoy
              gamePadStyle={gamePadStyle}
              gamePadButtonStyle={gamePadButtonStyle}
            />
            {/* 다른 컴포넌트 */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **주요 기능**:
  - **방향 버튼**: `GameBoyDirections` 배열을 기반으로 방향 버튼을 구현합니다.
  - **컨텍스트 인식 렌더링**: `GaesupWorldContext`의 `mode.controller` 값에 따라 컴포넌트를 렌더링합니다.
  - **커스터마이징**: `gamePadStyle`과 `gamePadButtonStyle`을 통해 외관을 자유롭게 커스터마이징할 수 있습니다.

---

#### GamePad

- **설명**: 다양한 컨트롤러 모드를 지원하는 커스터마이징 가능한 컨트롤러 인터페이스입니다. 조이스틱, GameBoy 등 다양한 입력 시나리오에 유연하게 대응할 수 있습니다.
  
- **Props**:

  | Prop Name            | Type            | Required | Description               | Default Value |
  | -------------------- | --------------- | -------- | ------------------------- | ------------- |
  | `gamePadStyle`       | object (styles) | Optional | GamePad 컨테이너 스타일   | `undefined`   |
  | `gamePadButtonStyle` | object (styles) | Optional | 개별 GamePad 버튼 스타일  | `undefined`   |
  | `label`              | string          | Optional | 버튼에 대한 커스텀 레이블 | `undefined`   |

- **사용 예제**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, GamePad } from '../../../src';

  export default function App() {
    const gamePadStyle = {
      /* GamePad 컨테이너 스타일 정의 */
    };
    const gamePadButtonStyle = {
      /* GamePad 버튼 스타일 정의 */
    };

    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'gamepad', // 또는 'joystick', 'gameboy' 등
        }}
      >
        <Canvas>
          <Physics>
            <GamePad
              gamePadStyle={gamePadStyle}
              gamePadButtonStyle={gamePadButtonStyle}
            />
            {/* 다른 컴포넌트 */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **주요 기능**:
  - **동적 버튼 렌더링**: `GaesupWorldContext`의 `control` 객체를 기반으로 버튼을 동적으로 생성합니다.
  - **범용 사용**: 조이스틱, GameBoy 등 다양한 컨트롤러 모드를 지원하여 다양한 입력 시나리오에 대응합니다.
  - **커스터마이징**: `gamePadStyle`과 `gamePadButtonStyle`을 통해 외관을 자유롭게 커스터마이징할 수 있습니다.

---

#### ZoomButton

- **설명**: 카메라를 특정 위치로 이동시키고 줌을 제어하는 버튼 컴포넌트입니다. 주로 특정 타겟으로의 줌인/줌아웃에 사용됩니다.
  
- **Props**:

  | Prop Name         | Type            | Required | Description                           | Default Value |
  | ----------------- | --------------- | -------- | ------------------------------------- | ------------- |
  | `position`        | THREE.Vector3   | Required | 카메라가 이동할 목표 위치             | None          |
  | `children`        | React.ReactNode | Optional | 버튼 내에 렌더링할 React 노드         | `undefined`   |
  | `target`          | THREE.Vector3   | Optional | 카메라가 바라볼 타겟 위치             | `undefined`   |
  | `keepBlocking`    | boolean         | Optional | 카메라 이동 중 블로킹을 유지할지 여부 | `undefined`   |
  | `zoomButtonStyle` | object (styles) | Optional | ZoomButton 컴포넌트의 스타일          | `undefined`   |

- **사용 예제**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, ZoomButton } from '../../../src';
  import * as THREE from 'three';

  export default function App() {
    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'keyboard',
        }}
      >
        <Canvas>
          <Physics>
            <ZoomButton
              position={new THREE.Vector3(0, 0, 5)}
              target={new THREE.Vector3(0, 0, 0)}
              zoomButtonStyle={{ backgroundColor: 'blue', color: 'white' }}
            >
              Zoom In
            </ZoomButton>
            {/* 다른 컴포넌트 */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **주요 기능**:
  - **카메라 이동**: 버튼 클릭 시 카메라를 지정된 위치로 이동시킵니다.
  - **줌 제어**: 카메라의 줌 레벨을 조절할 수 있습니다.
  - **커스터마이징**: `zoomButtonStyle`을 통해 버튼의 외관을 자유롭게 커스터마이징할 수 있습니다.

---

#### JumpPortal

- **설명**: 클릭 가능한 포탈을 통해 사용자를 지정된 위치로 텔레포트할 수 있는 컴포넌트입니다. 인터랙티브한 텔레포테이션 포인트를 생성하는 데 사용됩니다.
  
- **Props**:

  | Prop Name         | Type          | Required | Description                                    | Default Value |
  | ----------------- | ------------- | -------- | ---------------------------------------------- | ------------- |
  | `text`            | string        | Optional | 포탈에 표시할 텍스트                           | `undefined`   |
  | `position`        | THREE.Vector3 | Required | 텔레포트할 목표 위치                           | None          |
  | `jumpPortalStyle` | CSSProperties | Optional | 포탈의 외관을 커스터마이징하기 위한 CSS 스타일 | `undefined`   |

- **사용 예제**:

  ```tsx
  import React from 'react';
  import { Canvas } from '@react-three/fiber';
  import { Physics } from '@react-three/rapier';
  import { GaesupWorld, JumpPortal } from '../../../src';
  import * as THREE from 'three';

  export default function App() {
    return (
      <GaesupWorld
        url={{
          characterUrl: 'https://your-s3-bucket/gaesupyee.glb',
        }}
        mode={{
          controller: 'keyboard',
        }}
      >
        <Canvas>
          <Physics>
            <JumpPortal
              text="Teleport"
              position={new THREE.Vector3(10, 0, 5)}
              jumpPortalStyle={{ backgroundColor: "blue", color: "white" }}
            />
            {/* 다른 컴포넌트 */}
          </Physics>
        </Canvas>
      </GaesupWorld>
    );
  }
  ```

- **주요 기능**:
  - **텔레포트 기능**: 버튼 클릭 시 카메라와 캐릭터를 지정된 위치로 이동시킵니다.
  - **커스터마이징**: `jumpPortalStyle`을 통해 포탈의 외관을 자유롭게 커스터마이징할 수 있습니다.
  - **텍스트 표시**: 포탈에 표시할 텍스트를 통해 사용자에게 명확한 안내를 제공합니다.

---

## 기여 방법

**Gaesup World**에 기여하고 싶으신가요? 다음 단계를 따라주세요:

1. **프로젝트 포크(Fork)**: GitHub에서 이 저장소를 포크하세요.
2. **개발 브랜치로 전환**: `dev` 브랜치로 이동합니다.

   ```bash
   git checkout dev
   ```

3. **변경 사항 커밋**: 변경한 내용을 커밋합니다.

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **브랜치에 푸시**: 변경한 브랜치를 원격 저장소에 푸시합니다.

   ```bash
   git push origin dev
   ```

5. **풀 리퀘스트 생성**: GitHub에서 풀 리퀘스트를 생성하여 변경 사항을 제출합니다.

---

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE)를 참고하세요.

---

## 추가 정보

**Gaesup World**는 지속적으로 업데이트되고 있으며, 사용자 피드백을 바탕으로 기능이 개선되고 있습니다. 더 자세한 정보나 도움이 필요하시다면 [GitHub 이슈 트래커](https://github.com/jigglypop/../../../src/issues)를 통해 문의해 주세요.

---

**Gaesup World**와 함께 몰입감 있는 웹 3D 환경을 구축해 보세요!
