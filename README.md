# Gaesup World

[![Version](https://img.shields.io/npm/v/gaesup-world?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/gaesup-world)
[![Downloads](https://img.shields.io/npm/dt/gaesup-world.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/gaesup-world)

Web 3D Character Controller and World Platform Library

[![main](https://github.com/jigglypop/gaesup-world/blob/master/image/main_image.png)](https://codesandbox.io/p/github/jigglypop/gaesup-world-examples/master?workspaceId=e8ae627a-af61-415e-aa21-1fe5af422c86)

> click and watch code sandbox example!

---

## introduction

Gaesup World is a library that uses @react/three-fiber, @react/three-drei, and rapier to provide control tools for characters, airplanes, cars, and more in a web 3D environment. This controller is designed to easily manage character movement, animation, and interaction. It allows for easy manipulation of characters or vehicles in a virtual world, and is also equipped with utilities like minimaps and joysticks.

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

## Tools

#### [Tools](#tools)
