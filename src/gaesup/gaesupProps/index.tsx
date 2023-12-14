import { vec3 } from "@react-three/rapier";
import { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../world/context/index.js";

export default function GaeSupProps({
  text,
  position,
  jumpPoint,
  children,
}: {
  text: string;
  position?: [number, number, number];
  jumpPoint?: boolean;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { minimap, points } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  useEffect(() => {
    if (jumpPoint && position) {
      points.push({
        text,
        position: vec3().set(position[0], 5, position[2]),
      });
      dispatch({
        type: "update",
        payload: {
          points: [...points],
        },
      });
    }
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = vec3(box.getSize(new THREE.Vector3()))
        .clone()
        .multiplyScalar(minimap.ratio);
      const center = vec3(box.getCenter(new THREE.Vector3()))
        .clone()
        .multiplyScalar(minimap.ratio);
      const obj = {
        text,
        size,
        center,
      };
      minimap.props[text] = obj;
      dispatch({
        type: "update",
        payload: {
          minimap: {
            ...minimap,
          },
        },
      });
    }
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
}
