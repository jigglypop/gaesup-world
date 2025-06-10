"use client";

import useMesh from "@store/mesh";
import useModal from "@store/modal";
import useTileParent from "@store/tileParent";
import useUpdateRoom from "@store/update";
import { useEscCloseEffect } from "@utils/escClose";

export default function TileEditor() {
  const { updateRoom, closeCurrent } = useUpdateRoom();
  const { tileParent } = useTileParent();
  const { current } = updateRoom;
  const { current_id, meshes } = useMesh();
  const { isOpen } = useModal();
  useEscCloseEffect(closeCurrent);

  return (
    <>
      {current && tileParent && current_id && meshes?.[current_id] && (
        <>
          <group position={isOpen ? [0, 0, 0] : current.position}>
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[4.1, 1.1, 4.1]} />
              <meshStandardMaterial
                color={meshes[current_id].color}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        </>
      )}
    </>
  );
}
