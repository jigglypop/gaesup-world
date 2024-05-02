import { ThreeEvent } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { useClicker } from "../hooks/useClicker";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../world/context";

export function GaeSupProps({
  type = "normal",
  text,
  position,
  children,
}: {
  type?: "normal" | "ground";
  text?: string;
  position?: [number, number, number];
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { minimap } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  // clicker
  const { moveClicker, moveDoubleClicker } = useClicker();

  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current);
      const size = vec3(box.getSize(new THREE.Vector3())).clone();
      const center = vec3(box.getCenter(new THREE.Vector3())).clone();
      const obj = {
        type: type ? type : "normal",
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
    <group
      ref={groupRef}
      position={position}
      onPointerDown={(e) => {
        if (e.srcElement instanceof HTMLDivElement) return;
        moveClicker(e, false, type);
      }}
      onDoubleClick={(e: ThreeEvent<PointerEvent>) => {
        if (e.srcElement instanceof HTMLDivElement) return;
        moveDoubleClicker(e, true, type);
      }}
    >
      {children}
    </group>
  );
}
