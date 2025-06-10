"use client";

import ThreeObject from "@common/threeObject";
import { PivotControls } from "@react-three/drei";
import { euler } from "@react-three/rapier";
import useModal from "@store/modal";
import useUpdateRoom from "@store/update";
import { convertN3 } from "@utils/convertor";
import { useArrowKeyInit } from "@utils/escClose";
import { useMemo } from "react";
import * as THREE from "three";

export default function ThreeObjectPreview() {
  const { updateRoom, setRotation } = useUpdateRoom();
  const { current } = updateRoom;
  const { isOpen } = useModal();
  const materials = useMemo(() => {
    const materials = [];

    for (let i = 0; i < 6; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: updateRoom.option.move && !isOpen ? "#00ff95" : "#ff0000",
        transparent: true,
        opacity: i === 4 ? 0.0 : 0.1,
      });
      materials.push(material);
    }
    return materials;
  }, [updateRoom.option.move, isOpen]);
  useArrowKeyInit();
  return (
    <>
      {current && (
        <group>
          <ThreeObject
            {...current}
            position={convertN3(current.position || [0.0, 0.0, 0.0])}
            rotation={convertN3(current.rotation || [0.0, 0.0, 0.0])}
            scale={convertN3(current.scale || [1.0, 1.0, 1.0])}
            isEditor={true}
          />
          <group position={current.position}>
            <mesh
              key={current.three_object_id + "_box_inner"}
              position={[0, 2.1, 0]}
              material={materials}>
              <boxGeometry
                args={
                  current.count === undefined
                    ? [3.95, 3.95 + 0.1, 3.95]
                    : [
                        3.95 * current.count[0],
                        3.95 + 0.1,
                        3.95 * current.count[2],
                      ]
                }
              />
            </mesh>
            {updateRoom.option.turn && (
              <PivotControls
                scale={10}
                activeAxes={[true, true, true]}
                disableSliders={true}
                lineWidth={3}
                opacity={0.5}
                onDrag={(_, matrix) => {
                  const rotation = euler().setFromRotationMatrix(matrix);
                  setRotation({ rotation });
                }}></PivotControls>
            )}
          </group>
        </group>
      )}
    </>
  );
}
