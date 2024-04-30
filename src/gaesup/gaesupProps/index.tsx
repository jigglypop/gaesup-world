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
  const { minimap, clickerOption } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  // clicker
  const { moveClicker } = useClicker();

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

  let lastClickTime = 0;
  function handleClick(e, cb, gap) {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;
    if (timeDiff < gap) {
      e.preventDefault();
      return;
    } else {
      cb(e);
      lastClickTime = currentTime;
    }
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        handleClick(e, moveClicker, clickerOption.throttle || 100);
      }}
      onDoubleClick={(e: any) => {
        e.stopPropagation();
      }}
    >
      {children}
    </group>
  );
}
