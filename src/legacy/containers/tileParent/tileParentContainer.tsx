"use client";

import TileParentsComponent from "@components/tileParents";
import useMeshQuery from "@store/mesh/query";
import { useTileParentQuery } from "@store/tileParent/query";

export default function TileParentContainer({
  isUpdate,
}: {
  isUpdate: boolean;
}) {
  const { tileParentMap, tilesByParentsId } = useTileParentQuery();
  const { meshes } = useMeshQuery();

  return (
    <>
      {tileParentMap && tilesByParentsId && meshes && (
        <TileParentsComponent
          tileParentMap={tileParentMap}
          tilesByParentsId={tilesByParentsId}
          meshes={meshes}
          isUpdate={isUpdate}
        />
      )}
    </>
  );
}
