"use client";

import { Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { GaeSupProps } from "../../src";

export default function Direction() {
  const direct = 50;
  return (
    <GaeSupProps text="direction">
      {/* east */}
      <RigidBody position={[-direct, 0, 0]}>
        <Text
          position={[0, 5, 0]}
          fontSize={3}
          rotation={[0, 0, 0]}
          color="black"
        >
          EAST
        </Text>
      </RigidBody>
      {/* west */}
      <RigidBody position={[direct, 0, 0]}>
        <Text
          position={[0, 5, 0]}
          fontSize={3}
          rotation={[0, 0, 0]}
          color="black"
        >
          WEST
        </Text>
      </RigidBody>
      <RigidBody position={[0, 0, direct]}>
        <Text
          position={[0, 5, 0]}
          fontSize={3}
          rotation={[0, 0, 0]}
          color="black"
        >
          SOUTH
        </Text>
      </RigidBody>
      <RigidBody position={[0, 0, -direct]}>
        <Text
          position={[0, 5, 0]}
          fontSize={3}
          rotation={[0, 0, 0]}
          color="black"
        >
          NORTH
        </Text>
      </RigidBody>
    </GaeSupProps>
  );
}
