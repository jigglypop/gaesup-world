import { getNpcs } from "@api/npc";
import { ANIMATION_MAP } from "@constants/main";
import {
  convertThreeObjectRequest,
  getDefaultThreeObject,
} from "@store/threeObject/atom";
import { threeObjectType } from "@store/threeObject/type";
import { useToast } from "@store/toast";
import useUpdateRoom from "@store/update";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { convertN3 } from "@utils/convertor";
import { V3 } from "gaesup-world";
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useCallback } from "react";
import { defaultNpc, npcAtom, resetNpcAtom } from "./atom";
import { npcAndThreeObjectsResponseType, npcType, npcUpdateType } from "./type";

export default function useNpc() {
  const [npcState, setNpc] = useAtom(npcAtom);
  const { npc, npc_id, create, update, npcsById } = npcState;
  const resetNpc = useResetAtom(resetNpcAtom);
  const { addToast } = useToast();
  const { updateRoom, current } = useUpdateRoom();
  const queryClient = useQueryClient();
  const { data: NpcResponse } = useQuery({
    queryKey: ["npcs"],
    queryFn: getNpcs,
  });

  const updateNpc = <K extends keyof typeof defaultNpc>(
    key: K,
    value: (typeof defaultNpc)[K]
  ) => {
    setNpc((prev) => {
      const updatedNpc = prev.npc
        ? { ...prev.npc, [key]: value }
        : { ...defaultNpc, [key]: value };
      return { ...prev, npc: updatedNpc };
    });
  };

  // Usage

  const setNullNpc = useCallback(
    (tag: "glass" | "hat" | "left_hand" | "right_hand") => {
      setNpc((prev) => {
        if (prev.npc && prev.npc[tag]) prev.npc[tag] = null;
        return {
          ...prev,
        };
      });
    },
    [setNpc]
  );

  const setNpcObject = useCallback(
    (
      item: Partial<threeObjectType>,
      object_type:
        | "body"
        | "clothes"
        | "glass"
        | "hat"
        | "left_hand"
        | "right_hand"
    ) => {
      setNpc((prev) => {
        if (prev.npc)
          prev.npc[object_type] = {
            ...getDefaultThreeObject({
              object_type,
              object_name: item.object_name,
              gltf_url: item.gltf_url,
              link_url: null,
            }),
          };
        return {
          ...prev,
        };
      });
    },
    [setNpc]
  );

  const setNpcInfo = (info: string) => updateNpc("info", info);
  const setNpcLinkUrl = (link_url: string) => updateNpc("link_url", link_url);
  const setNpcAnimation = (current_animation: keyof typeof ANIMATION_MAP) =>
    updateNpc("current_animation", current_animation);
  const setNpcUsername = (username: string) => updateNpc("username", username);

  const convertNPC = (npc: npcUpdateType) => {
    const createNpcObject = (
      item: threeObjectType | null
    ): threeObjectType | null =>
      item
        ? {
            ...item,
            position: convertN3(current?.position || V3(0, 0, 0)),
            rotation: convertN3(current?.rotation || V3(0, 0, 0)),
            scale: convertN3(current?.scale || V3(1, 1, 1)),
            color: item.color || null,
            pamplet_url: item.pamplet_url || null,
            poster_url: item.poster_url || null,
          }
        : null;

    const threeObjects = [
      createNpcObject(npc.body),
      createNpcObject(npc.clothes),
      createNpcObject(npc.glass),
      createNpcObject(npc.hat),
      createNpcObject(npc.right_hand),
      createNpcObject(npc.left_hand),
    ].filter((item): item is threeObjectType => item !== null);

    const newNpc: npcType = {
      npc_id: "-1",
      username: npc.username,
      current_animation: npc.current_animation,
      modal_name: npc.modal_name,
      link_url: npc.link_url,
      info: npc.info,
      threeObjects,
    };
    return newNpc;
  };

  const onNpcCreate = () => {
    setNpc((prev) => {
      if (updateRoom.current === null || !npc) return prev;
      const _id = [updateRoom.current.position].join("_");
      const _npc = convertNPC(npc);
      if (npc.username === "" || npc.username === null) {
        addToast({
          text: "생성 에러 : npc 이름을 입력하세요.",
          type: {
            type: "error",
          },
        });
        return { ...prev };
      }
      addToast({ text: `${npc.username}가 생성되었습니다.` });
      return {
        ...prev,
        create: {
          ...prev.create,
          [_id]: _npc,
        },
      };
    });
  };
  const onNpcDelete = useCallback((id: string) => {
    setNpc((prev) => {
      if (!NpcResponse) return { ...prev };

      const { npcs, threeObjects } = NpcResponse;
      if (!npcs || !threeObjects) return { ...prev };
      const npc = npcs.find((n) => n.npc_id === id);
      if (npc && npcs) {
        const _threeObjects = threeObjects.filter((t) => t.npc_id === id);
        npc.threeObjects = [
          ..._threeObjects.map((t) => {
            return convertThreeObjectRequest(t);
          }),
        ];

        prev.delete[id] = npc;
        NpcResponse.npcs = npcs.filter(
          (n) => !prev.delete.hasOwnProperty(n.npc_id)
        );
        NpcResponse.threeObjects = threeObjects.filter(
          (t) => t.npc_id && !prev.delete.hasOwnProperty(t.npc_id)
        );

        queryClient.setQueryData(["npcs"], { ...NpcResponse });
        addToast({ text: "npc가 임시 삭제되었습니다." });
      } else if (prev.create.hasOwnProperty(id)) {
        delete prev.create[id];
        addToast({ text: "npc 생성이 취소되었습니다." });
      }
      return { ...prev };
    });
  }, []);

  const processNpc = (
    data: npcAndThreeObjectsResponseType | undefined
  ): npcType[] => {
    if (!data) return [];
    const { npcs, threeObjects } = data;
    const npcObject = Object.fromEntries(
      npcs.map((npc) => [
        npc.npc_id,
        {
          npc_id: npc.npc_id,
          current_animation: npc.current_animation,
          username: npc.username,
          modal_name: npc.modal_name,
          link_url: npc.link_url,
          info: npc.info,
          threeObjects: [] as threeObjectType[],
        },
      ])
    );
    threeObjects.forEach((obj: threeObjectType) => {
      if (obj.npc_id && npcObject[obj.npc_id]) {
        npcObject[obj.npc_id].threeObjects.push(obj);
      }
    });
    return Object.values(npcObject);
  };

  return {
    npc,
    npcState,
    create,
    update,
    origin,
    onNpcCreate,
    onNpcDelete,
    setNullNpc,
    setNpc,
    resetNpc,
    setNpcUsername,
    setNpcLinkUrl,
    setNpcInfo,
    setNpcObject,
    setNpcAnimation,
    convertNPC,
    processNpc,
    npc_id,
    npcsById: npcsById,
  };
}
