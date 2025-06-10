import {
  postNpcSaveRoom,
  postPortalSaveRoom,
  postThreeObjecSaveRoom,
  postTileSaveRoom,
  postWallSaveRoom,
} from "@api/save";
import { getThreeObjects } from "@api/threeObject";
import { min } from "@constants/time";
import { npcAtom } from "@store/npc/atom";
import { npcType } from "@store/npc/type";
import { portalAtom } from "@store/portal/atom";
import { portalType } from "@store/portal/type";
import { threeObjectAtom } from "@store/threeObject/atom";
import { tileAtom } from "@store/tile/atom";
import { tileType } from "@store/tile/type";
import { useToast } from "@store/toast";
import { wallAtom } from "@store/wall/atom";
import { wallType } from "@store/wall/type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { threeObjectType } from "../threeObject/type";

// 룸 초기화 객체 가져오기
export const useOrigin = () => {
  const { data: origin, isSuccess: isOriginSuccess } = useQuery({
    queryKey: ["origin_objects"],
    queryFn: getThreeObjects,
    staleTime: 10 * min,
  });

  return {
    origin,
    isOriginSuccess,
  };
};
// 룸 저장
export const useSaveThreeObjects = () => {
  const queryClient = useQueryClient();
  const [threeObjects] = useAtom(threeObjectAtom);
  const { addToastAsync } = useToast();
  const { mutateAsync: saveThreeObjects } = useMutation({
    mutationKey: ["save_three_objects"],
    mutationFn: async () => {
      const request = {
        create: Object.values(threeObjects.create),
        update: Object.values(threeObjects.update),
        delete: threeObjects.delete,
      };
      return await postThreeObjecSaveRoom(request);
    },
    onSuccess: async (res: threeObjectType[]) => {
      await queryClient.setQueryData(["threeObjects"], res);
      await addToastAsync({ text: "성공적으로 저장되었습니다." });
    },
    onError: async (error) => {
      await addToastAsync({
        text: "생성 실패: " + error.message,
        type: { type: "error" },
      });
    },
  });
  return {
    saveThreeObjects,
  };
};
// 룸 저장
export const useSaveNpc = () => {
  const queryClient = useQueryClient();
  const [npcs] = useAtom(npcAtom);
  const { addToastAsync } = useToast();
  const { mutateAsync: saveNpcs } = useMutation({
    mutationKey: ["save_npcs"],
    mutationFn: async () => {
      const request = {
        create: Object.values(npcs.create),
        update: Object.values(npcs.update),
        delete: Object.values(npcs.delete),
      };
      return await postNpcSaveRoom(request);
    },
    onSuccess: async (res: npcType[]) => {
      await queryClient.setQueryData(["npcs"], res);
      await addToastAsync({ text: "성공적으로 저장되었습니다." });
    },
    onError: async (error) => {
      await addToastAsync({
        text: "생성 실패: " + error.message,
        type: { type: "error" },
      });
    },
  });

  return {
    saveNpcs,
  };
};

// 룸 저장
export const useSaveTile = () => {
  const queryClient = useQueryClient();
  const [tiles] = useAtom(tileAtom);
  const { addToastAsync } = useToast();
  const { mutateAsync: saveTiles } = useMutation({
    mutationKey: ["save_tiles"],
    mutationFn: async () => {
      const request = {
        create: Object.values(tiles.create),
        update: Object.values(tiles.update),
        delete: Object.values(tiles.delete),
      };
      return await postTileSaveRoom(request);
    },
    onSuccess: async (res: tileType[]) => {
      await queryClient.setQueryData(["tiles"], res);
      await addToastAsync({ text: "성공적으로 저장되었습니다." });
    },
    onError: async (error) => {
      await addToastAsync({
        text: "생성 실패: " + error.message,
        type: { type: "error" },
      });
    },
  });

  return {
    saveTiles,
  };
};

// 타일들 저장
export const useSaveWall = () => {
  const queryClient = useQueryClient();
  const [walls] = useAtom(wallAtom);
  const { addToastAsync } = useToast();
  const { mutateAsync: saveWalls } = useMutation({
    mutationKey: ["save_walls"],
    mutationFn: async () => {
      const request = {
        create: Object.values(walls.create),
        update: Object.values(walls.update),
        delete: Object.values(walls.delete),
      };
      return await postWallSaveRoom(request);
    },
    onSuccess: async (res: wallType[]) => {
      await queryClient.setQueryData(["walls"], res);
      await addToastAsync({ text: "성공적으로 저장되었습니다." });
    },
    onError: async (error) => {
      await addToastAsync({
        text: "생성 실패: " + error.message,
        type: { type: "error" },
      });
    },
  });

  return {
    saveWalls,
  };
};
// 포탈들 저장
export const useSavePortal = () => {
  const queryClient = useQueryClient();
  const [portal] = useAtom(portalAtom);
  const { addToastAsync } = useToast();
  const { mutateAsync: savePortals } = useMutation({
    mutationKey: ["save_portal"],
    mutationFn: async () => {
      const request = {
        create: Object.values(portal.create),
        delete: Object.values(
          Object.values(portal.delete).map((p) => {
            return p.id;
          })
        ),
      };
      return await postPortalSaveRoom(request);
    },
    onSuccess: async (res: portalType[]) => {
      await queryClient.setQueryData(["portals"], res);
      await addToastAsync({ text: "성공적으로 저장되었습니다." });
    },
    onError: async (error) => {
      await addToastAsync({
        text: "생성 실패: " + error.message,
        type: { type: "error" },
      });
    },
  });

  return {
    savePortals,
  };
};
