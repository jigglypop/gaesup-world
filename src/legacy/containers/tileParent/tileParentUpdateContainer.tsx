"use client";

import TileParentsComponent from "@components/tileParents";
import useMeshQuery from "@store/mesh/query";
import useTile from "@store/tile";
import { useTileParentQuery } from "@store/tileParent/query";

export default function TileParentUpdateContainer() {
  const { tilesByParentsId } = useTile();
  const { meshes } = useMeshQuery();
  const { tileParentMap } = useTileParentQuery();

  return (
    <>
      {tileParentMap && tilesByParentsId && meshes && (
        <TileParentsComponent
          tileParentMap={tileParentMap}
          tilesByParentsId={tilesByParentsId}
          meshes={meshes}
          isUpdate={true}
        />
      )}
    </>
  );
}
