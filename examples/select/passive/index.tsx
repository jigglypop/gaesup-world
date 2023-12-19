"use client";

import { useGaesupController } from "../../../src/gaesup";
import { GaesupPassiveComponent } from "../../../src/gaesup/component";
import { V3 } from "../../../src/gaesup/utils";

export default function Passive() {
  const {
    state,
    mode,
    currentAnimation,
    url,
    vehicleCollider,
    wheelOffset,
    characterCollider,
    airplaneCollider,
  } = useGaesupController();
  const _euler = state.euler.clone();
  // 4개 실험
  const X = 0.5;
  const Y = 0.5;

  const stateStack = [];

  for (let i = -0.5; i < X; i++) {
    for (let j = -0.5; j < Y; j++) {
      const _state = {
        ...state,
        position: state.position.clone().add(V3(i * 10, 0, j * 10)),
        euler: _euler,
      };
      stateStack.push(_state);
    }
  }
  return (
    <group>
      {stateStack.map((state, index) => {
        return (
          <GaesupPassiveComponent
            key={index}
            mode={mode}
            state={state}
            wheelOffset={0.5}
            vehicleCollider={vehicleCollider}
            characterCollider={characterCollider}
            airplaneCollider={airplaneCollider}
            currentAnimation={currentAnimation}
            url={url}
          />
        );
      })}
    </group>
  );
}
