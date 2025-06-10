import { useToast } from "@store/toast";
import { updateRoomAtom } from "@store/update/atom";
import useWallParent from "@store/wallParent";
import { useWallParentQuery } from "@store/wallParent/query";
import { convertN3 } from "@utils/convertor";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { wallAtom } from "./atom";

export default function useWall() {
  const [walls] = useAtom(wallAtom);
  const [updateRoom, setUpdateRoom] = useAtom(updateRoomAtom);
  const [_, setWall] = useAtom(wallAtom);
  const { wallParent } = useWallParent();
  const { addToast } = useToast();
  const { wallsByParentsId, updateWalls } = useWallParentQuery();

  const setWallType = useCallback(
    ({ wall_type }: { wall_type: any }) => {
      setUpdateRoom((prev) => {
        if (prev.current === null) return { ...prev };
        prev.current.wall_type = wall_type;
        return { ...prev };
      });
    },
    [setUpdateRoom]
  );

  const onWallCreate = () => {
    setWall((prev) => {
      if (updateRoom.current === null || !wallParent) return { ...prev };
      const position = convertN3(updateRoom.current.position || [0, 0, 0]);
      position[1] = 0;
      const _id = position.join("_") + updateRoom.current.direction;
      prev.create[_id] = {
        id: _id,
        position: convertN3(updateRoom.current.position || [0, 0, 0]),
        rotation: convertN3(updateRoom.current.rotation || [0, 0, 0]),
        wall_parent_id: wallParent.wall_parent_id,
      };
      addToast({ text: _id + "가 생성되었습니다." });
      return { ...prev };
    });
  };

  const onWallDelete = useCallback(
    (id: string, wall_parent_id: string) => {
      let deleted = false;

      if (wallsByParentsId && wallsByParentsId[wall_parent_id]) {
        const walls = wallsByParentsId[wall_parent_id];
        const wallIndex = walls.findIndex((wall) => wall.id === id);

        if (wallIndex !== -1) {
          const deletedWall = walls[wallIndex];
          const newWalls = [...walls];
          newWalls.splice(wallIndex, 1);
          updateWalls(wall_parent_id, newWalls);
          setWall((prev) => ({
            ...prev,
            delete: {
              ...prev.delete,
              [id]: deletedWall,
            },
          }));
          deleted = true;
          addToast({ text: "벽이 삭제되었습니다." });
        }
      }

      if (!deleted) {
        setWall((prev) => {
          if (prev.create.hasOwnProperty(id)) {
            const { [id]: _, ...restCreate } = prev.create;
            addToast({ text: "벽 생성이 취소되었습니다." });
            return { ...prev, create: restCreate };
          }
          return prev;
        });
      }
    },
    [wallsByParentsId, updateWalls, setWall]
  );
  return {
    onWallCreate,
    onWallDelete,
    setWallType,
    update: walls.update,
    create: walls.create,
    delete: walls.delete,
    walls,
  };
}
