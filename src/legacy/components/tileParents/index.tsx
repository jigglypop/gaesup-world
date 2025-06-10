import { GaeSupProps } from "gaesup-world";
import TileParent from "./tileParent";
import { tileParentsComponentType } from "./type";

export default function TileParentsComponent({
  tilesByParentsId,
  tileParentMap,
  meshes,
  isUpdate,
}: tileParentsComponentType) {
  return (
    <GaeSupProps type={"ground"}>
      {tilesByParentsId &&
        meshes &&
        Object.values(tilesByParentsId).length !== 0 &&
        Object.keys(tilesByParentsId).map((key, index) => {
          const tileParent = tileParentMap[key];
          const tiles = tilesByParentsId[key];
          if (tileParent?.floor_mesh_id === null) return <></>;
          const mesh = meshes[tileParent?.floor_mesh_id];
          return (
            <TileParent
              key={index}
              mesh={mesh}
              tiles={tiles}
              tileParent={tileParent}
              isUpdate={isUpdate}
            />
          );
        })}
    </GaeSupProps>
  );
}
