"use client";

import WallParent from "@components/wallParents";
import useUpdateRoom from "@store/update";
import { n3 } from "@store/update/type";
import useWallParent from "@store/wallParent";
import { convertN3 } from "@utils/convertor";
import { useArrowKeyInit, useEscCloseEffect } from "@utils/escClose";

export default function WallEditor() {
  const { updateRoom, closeCurrent } = useUpdateRoom();
  const { wallParent } = useWallParent();
  const { current } = updateRoom;
  useEscCloseEffect(closeCurrent);
  useArrowKeyInit();

  const _p: n3 = convertN3(current?.position || [0.0, 0.0, 0.0]);

  return (
    <>
      {current && wallParent && (
        <group position={_p}>
          <WallParent
            walls={[
              {
                position: [0, 0, 0],
                rotation: [0, (current.rotation as n3)[1], 0],
                id: "temp",
                wall_parent_id: wallParent.wall_parent_id,
              },
            ]}
            wallParent={wallParent}
            isUpdate={false}
          />
        </group>
      )}
    </>
  );
}
