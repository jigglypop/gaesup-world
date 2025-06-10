import { FlagMesh } from "@common/mesh/flag";
import { FlagMeshProps } from "@common/mesh/flag/type";
import { FC, memo } from "react";

const PampletMesh: FC<FlagMeshProps> = ({ geometry, pamplet_url }) => {
  return (
    <FlagMesh
      geometry={geometry}
      pamplet_url={pamplet_url}
    />
  );
};

export const MemoizedPampletMesh = memo(
  PampletMesh,
  (prevProps, nextProps) =>
    prevProps.geometry === nextProps.geometry &&
    prevProps.pamplet_url === nextProps.pamplet_url
);
