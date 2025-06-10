"use client";

import NpcObject from "@common/npc";
import { PivotControls } from "@react-three/drei";
import { euler } from "@react-three/rapier";
import useModal from "@store/modal";
import useNpc from "@store/npc";
import useUpdateRoom from "@store/update";
import { useArrowKeyInit } from "@utils/escClose";

export default function NpcEditor() {
  const { updateRoom, setRotation } = useUpdateRoom();
  const { isOpen } = useModal();
  const { npc, convertNPC } = useNpc();
  const { current } = updateRoom;
  useArrowKeyInit();

  return (
    <>
      {current && (
        <>
          <NpcObject
            {...convertNPC(npc)}
            isUpdate={true}
          />
          <group
            position={current.position}
            rotation={current.rotation}>
            <mesh
              key={npc.body.three_object_id + "_box_inner"}
              position={[0, 2.1, 0]}>
              <boxGeometry
                args={
                  npc.body.count === undefined
                    ? [3.95, 3.95 + 0.1, 3.95]
                    : [
                        3.95 * npc.body.count[0],
                        3.95 + 0.1,
                        3.95 * npc.body.count[2],
                      ]
                }
              />
              <meshStandardMaterial
                color={
                  updateRoom.option.move && !isOpen ? "#00ff95" : "#ff0000"
                }
                transparent
                opacity={0.05}
              />
            </mesh>
            {updateRoom.option.turn && (
              <group position={[0, 4, 0]}>
                <PivotControls
                  scale={10}
                  activeAxes={[true, true, true]}
                  disableSliders={true}
                  lineWidth={3}
                  opacity={0.5}
                  onDrag={(local) => {
                    const rotation = euler().setFromRotationMatrix(local);
                    setRotation({ rotation });
                  }}
                />
              </group>
            )}
          </group>
        </>
      )}
    </>
  );
}
