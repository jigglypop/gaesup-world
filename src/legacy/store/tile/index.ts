import { tileAtom } from "@store/tile/atom";
import useTileParent from "@store/tileParent";
import { useToast } from "@store/toast";
import { updateRoomAtom } from "@store/update/atom";
import { useQueryClient } from "@tanstack/react-query";
import { convertN3 } from "@utils/convertor";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { useTileQuery } from "./query";

export default function useTile() {
  const [tilesState] = useAtom(tileAtom);
  const [updateRoom, setUpdateRoom] = useAtom(updateRoomAtom);
  const [tile, setTile] = useAtom(tileAtom);
  const { tileParent } = useTileParent();
  const { addToast } = useToast();
  const { getTilesByParentsId, tiles } = useTileQuery();
  const queryClient = useQueryClient();

  const onTileCreate = useCallback(() => {
    const toastText = {
      id: "0",
      name: "이름",
    };
    setTile((prev) => {
      if (updateRoom.current === null || !tileParent) return { ...prev };
      const _id = [updateRoom.current.position].join("_");
      prev.create[_id] = {
        id: _id.toString(),
        collideable: updateRoom.current.collideable || true,
        position: convertN3(updateRoom.current.position || [0, 0, 0]),
        tile_parent_id: tileParent.tile_parent_id,
      };
      prev.tilesByParentsId = getTilesByParentsId([
        ...Object.values({
          ...tilesState.update,
          ...tilesState.create,
        }),
      ]);
      toastText.id = _id.toString();
      toastText.name = _id.toString();
      addToast({ text: toastText.name + "가 생성되었습니다." });
      return { ...prev };
    });
  }, [setTile, tile, tileParent]);

  const onTileDelete = useCallback(
    (id: string) => {
      setTile((prev) => {
        const tile = tiles?.find((t) => t.id === id);
        if (tile && tiles) {
          prev.delete[id] = tile;
          queryClient.setQueryData(
            ["tiles"],
            tiles.filter((t) => !prev.delete.hasOwnProperty(t.id))
          );
          addToast({ text: id + " 타일이 임시 삭제되었습니다." });
          return { ...prev };
        } else if (prev.create.hasOwnProperty(id)) {
          delete prev.create[id];
          addToast({ text: "타일 생성이 취소되었습니다." });
          return { ...prev };
        }
        return { ...prev };
      });
    },
    [setUpdateRoom]
  );

  const toggleCollideable = useCallback(
    (id: string) => {
      setTile((prev) => {
        const tile = tiles?.find((t) => t.id === id);
        if (tile && tiles) {
          tile.collideable = !tile.collideable;
          prev.update[id] = tile;
          queryClient.setQueryData(
            ["tiles"],
            tiles.filter((t) => !prev.delete.hasOwnProperty(t.id))
          );
          return { ...prev };
        } else if (prev.create.hasOwnProperty(id)) {
          prev.create[id].collideable = !prev.create[id].collideable;
          return { ...prev };
        }
        return { ...prev };
      });
    },
    [setUpdateRoom]
  );

  return {
    update: tilesState.update,
    create: tilesState.create,
    delete: tilesState.delete,
    tiles,
    onTileCreate,
    onTileDelete,
    tile,
    setTile,
    toggleCollideable,
    tilesByParentsId: getTilesByParentsId([
      ...Object.values({
        ...tilesState.update,
        ...tilesState.create,
      }).concat(tiles || []),
    ]),
    tileParent,
  };
}
