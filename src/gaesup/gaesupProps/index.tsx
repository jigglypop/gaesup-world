import { vec3 } from "@react-three/rapier";
import { Suspense, useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../world/context/index.js";

export function GaeSupProps({
  type,
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

  const groupComponent = useMemo(() => {
    return (
      <group ref={groupRef} position={position}>
        {children}
      </group>
    );
  }, []);
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

  return <Suspense fallback={null}>{groupComponent}</Suspense>;
}
