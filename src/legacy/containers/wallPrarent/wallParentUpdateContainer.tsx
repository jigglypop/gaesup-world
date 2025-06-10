"use client";

import WallParent from "@components/wallParents";
import useWall from "@store/wall";
import { wallType } from "@store/wall/type";
import { useWallParentQuery } from "@store/wallParent/query";

export default function WallParentUpdateContainer() {
  const { update, create } = useWall();
  const { wallParentMap } = useWallParentQuery();
  if (wallParentMap === undefined) return null;
  const groupedWalls = Object.values({ ...update, ...create }).reduce(
    (acc, wall) => {
      const parentId = wall.wall_parent_id;
      if (parentId === null) return acc;
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(wall);
      return acc;
    },
    {} as Record<string, wallType[]>
  );

  return (
    <>
      {Object.entries(groupedWalls).map(([parentId, walls]) => {
        const wallParent = wallParentMap[parentId];
        if (!wallParent) return null;
        return (
          <WallParent
            key={parentId}
            wallParent={wallParent}
            walls={walls}
            isUpdate={true}
          />
        );
      })}
    </>
  );
}
