"use client";

import WallParent from "@components/wallParents";
import { useWallParentQuery } from "@store/wallParent/query";

export default function WallParentContainer({
  isUpdate = false,
}: {
  isUpdate: boolean;
}) {
  const { wallParentMap, wallsByParentsId } = useWallParentQuery();
  if (wallParentMap === undefined) return null;
  if (wallsByParentsId === undefined) return null;
  return (
    <>
      {Object.keys(wallParentMap).map((key) => {
        const wallParent = wallParentMap[key];
        const walls = wallsByParentsId[key];
        if (!walls) return null;
        if (!wallParent) return null;
        return (
          <WallParent
            key={wallParent.wall_parent_id}
            wallParent={wallParent}
            walls={walls}
            isUpdate={isUpdate}
          />
        );
      })}
    </>
  );
}
