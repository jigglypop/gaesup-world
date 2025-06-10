"use client";

import NameTag from "@common/spriteTag";
import usePortal from "@store/portal";
import { n3 } from "@store/update/type";
import { useCallback } from "react";

export default function Portal({
  id,
  title,
  position,
}: {
  id: string;
  title?: string;
  position?: n3;
}) {
  const { onPortalDelete } = usePortal();

  const onDelete = useCallback(() => {
    if (id === "-1") return;
    onPortalDelete(id);
  }, [onPortalDelete, id]);

  return (
    <mesh position={position || [0.0, 0.0, 0.0]}>
      <group
        onClick={onDelete}
        position={[0, 4, 0]}>
        <NameTag
          text={title || "이름없음"}
          fontSize={1}
          background="rgba(0, 255, 255, 0.2)"
        />
      </group>

      <cylinderGeometry args={[2, 2, 4, 32]} />
      <meshStandardMaterial
        color={"rgba(0, 255, 255, 0.5)"}
        transparent
        opacity={0.2}
      />
    </mesh>
  );
}
