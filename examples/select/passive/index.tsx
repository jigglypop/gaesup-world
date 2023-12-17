"use client";

import { useGaesupController } from "../../../src/gaesup";
import { PassiveCharacter } from "../../../src/gaesup/component/passive/passiveCharacter";
import { V3 } from "../../../src/gaesup/utils";

export default function Passive() {
  const { state, mode, currentAnimation, url } = useGaesupController();
  const _euler = state.euler.clone();
  _euler.y += Math.PI;
  // 4개 실험
  const X = 1.5;
  const Y = 1.5;

  const stateStack = [];

  for (let i = -1.5; i < X; i++) {
    for (let j = -1.5; j < Y; j++) {
      const _state = {
        ...state,
        position: state.position.clone().add(V3(i * 2, 0, j * 2)),
        euler: _euler,
      };
      stateStack.push(_state);
    }
  }
  return (
    <group>
      {stateStack.map((state, index) => {
        return (
          <PassiveCharacter
            key={index}
            mode={mode}
            state={state}
            url={url.characterUrl}
            current={currentAnimation}
          />
        );
      })}
    </group>
  );
}
