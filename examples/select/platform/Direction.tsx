"use client";

import { Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { GaeSupProps } from "../../../src";

export default function Direction() {
  const direct = 7;
  return (
    <GaeSupProps text="direction" jumpPoint={true}>
      {/* east */}
      <RigidBody position={[-direct, 0, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={"blue"} />
        </mesh>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.3}
          rotation={[0, Math.PI / 2, 0]}
        >
          EAST
        </Text>
      </RigidBody>
      {/* west */}
      <RigidBody position={[direct, 0, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={"white"} />
        </mesh>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.3}
          rotation={[0, Math.PI / 2, 0]}
        >
          WEST
        </Text>
      </RigidBody>
      {/* south */}
      <RigidBody position={[0, 0, direct]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={"red"} />
        </mesh>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.3}
          rotation={[0, Math.PI / 2, 0]}
        >
          SOUTH
        </Text>
      </RigidBody>
      {/* north */}
      <RigidBody position={[0, 0, -direct]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={"black"} />
        </mesh>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.3}
          rotation={[0, Math.PI / 2, 0]}
        >
          NORTH
        </Text>
      </RigidBody>
    </GaeSupProps>
  );
}
