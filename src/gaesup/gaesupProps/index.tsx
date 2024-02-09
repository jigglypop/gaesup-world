import { vec3 } from "@react-three/rapier";
import { Suspense, useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import useClicker from "../hooks/useClicker";
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
  const { minimap, activeState, clicker } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  // clicker
  const { moveClicker } = useClicker();

  //   const moveClicker = (e: ThreeEvent<MouseEvent>) => {
  //     const originPoint = activeState.position;
  //     const newPosition = e.point;
  //     const newAngle = Math.atan2(
  //       newPosition.z - originPoint.z,
  //       newPosition.x - originPoint.x
  //     );
  //     const norm = Math.sqrt(
  //       Math.pow(newPosition.z - originPoint.z, 2) +
  //         Math.pow(newPosition.x - originPoint.x, 2)
  //     );
  //     if (norm < 1) return;
  //     dispatch({
  //       type: "update",
  //       payload: {
  //         clicker: {
  //           point: V3(e.point.x, e.point.y, e.point.z),
  //           angle: newAngle,
  //           isOn: true,
  //         },
  //       },
  //     });
  //   };
  //
  //   // 거리 계산
  //   useEffect(() => {
  //     const originPoint = activeState.position;
  //     const newPosition = clicker.point;
  //     const norm = Math.sqrt(
  //       Math.pow(newPosition.z - originPoint.z, 2) +
  //         Math.pow(newPosition.x - originPoint.x, 2)
  //     );
  //     if (norm < 1) {
  //       clicker.isOn = false;
  //       dispatch({
  //         type: "update",
  //         payload: {
  //           clicker: clicker,
  //         },
  //       });
  //     }
  //   }, [activeState.position, clicker.point]);

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
    <Suspense fallback={null}>
      <group
        ref={groupRef}
        position={position}
        // onClick={(e) => clickerPoint(e, activeState.position.clone())}
        onPointerDown={(e) => moveClicker(e, false)}
        onDoubleClick={(e) => moveClicker(e, true)}

        // onPointerOver={(e) => clickerPoint(e, activeState.position.clone())}
      >
        {children}
      </group>
    </Suspense>
  );
}
