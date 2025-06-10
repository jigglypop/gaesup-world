import { portalAtom } from "@store/portal/atom";
import { useToast } from "@store/toast";
import { updateRoomAtom } from "@store/update/atom";
import { useQueryClient } from "@tanstack/react-query";
import { convertN3 } from "@utils/convertor";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { usePortalQuery } from "./query";

export default function usePortal() {
  const [portalsState] = useAtom(portalAtom);
  const [updateRoom, setUpdateRoom] = useAtom(updateRoomAtom);
  const [portal, setPortal] = useAtom(portalAtom);
  const { addToast } = useToast();
  const { portals } = usePortalQuery();
  const queryClient = useQueryClient();

  const setPortalName = (title: string) => {
    setPortal((prev) => {
      if (prev.current) prev.current.title = title;
      return {
        ...prev,
      };
    });
  };

  const onPortalCreate = useCallback(() => {
    setPortal((prev) => {
      if (updateRoom.current === null) return { ...prev };
      const _id = [updateRoom.current.position].join("_");
      if (portalsState.current?.title === "") {
        addToast({ text: "포탈 이름이 필요합니다.", type: { type: "error" } });
        return { ...prev };
      }
      prev.create[_id] = {
        id: _id.toString(),
        title: portalsState.current?.title || "이름",
        position: convertN3(updateRoom.current.position || [0.0, 0.0, 0.0]),
      };
      addToast({ text: name + "가 생성되었습니다." });
      return { ...prev };
    });
  }, [setPortal, portal]);

  const onPortalDelete = useCallback(
    (id: string) => {
      setPortal((prev) => {
        const portal = portals?.find((t) => t.id === id);

        if (portal && portals) {
          prev.delete[id] = portal;
          queryClient.setQueryData(
            ["portals"],
            portals.filter((t) => !prev.delete.hasOwnProperty(t.id))
          );
          addToast({ text: id + ": 포탈이 임시 삭제되었습니다." });
          return { ...prev };
        } else if (prev.create.hasOwnProperty(id)) {
          delete prev.create[id];
          addToast({ text: id + ": 포탈 생성이 취소되었습니다." });
          return { ...prev };
        }
        return { ...prev };
      });
    },
    [setUpdateRoom]
  );

  return {
    update: portalsState.update,
    create: portalsState.create,
    delete: portalsState.delete,
    title: portalsState.current?.title,
    portals,
    onPortalCreate,
    onPortalDelete,
    portal,
    setPortal,
    setPortalName,
  };
}
