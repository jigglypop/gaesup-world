"use client";

import { PassiveCharacter, V3, useGaesupController } from "../../src";

export default function Passive() {
  const { state, mode, currentAnimation, urls } = useGaesupController();
  const points = [];
  for (let x = -5; x <= -5; x += 5) {
    for (let y = -5; y <= -10; y += 5) {
      points.push(V3(x, 0, y));
    }
  }

  return (
    <group>
      {/* <PassiveAirplane
        position={state.position.clone().add(V3(-4, 0, -4))}
        euler={state.euler.clone()}
        currentAnimation={currentAnimation}
        urls={url}
      ></PassiveAirplane> */}
      {points.map((point, index) => {
        return (
          <PassiveCharacter
            key={index}
            position={state.position.clone().add(point)}
            euler={state.euler.clone()}
            currentAnimation={currentAnimation}
            urls={urls}
            gravityScale={0}
          ></PassiveCharacter>
        );
      })}
      {/* <PassiveCharacter
        position={state.position.clone().add(V3(4, 0, 4))}
        euler={state.euler.clone()}
        currentAnimation={currentAnimation}
        urls={urls}
        gravityScale={0}
      >
        <Marker position={V3(0, 5, 0)}>
          <h1>hi</h1>
          <FaMapMarkerAlt style={{ color: "indianred", fontSize: "5rem" }} />
        </Marker>
      </PassiveCharacter> */}
    </group>
  );
}
