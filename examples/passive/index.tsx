"use client";

import { useGaesupController } from "../../src";

export default function Passive() {
  const { state, mode, currentAnimation, urls } = useGaesupController();
  return (
    <group>
      {/* <PassiveAirplane
        position={state.position.clone().add(V3(-4, 0, -4))}
        euler={state.euler.clone()}
        currentAnimation={currentAnimation}
        urls={url}
      ></PassiveAirplane> */}
    </group>
  );
}
