import useGltfList from "@store/gltfList";
import { useToast } from "@store/toast";
import { updateRoomAtom } from "@store/update/atom";
import { useQueryClient } from "@tanstack/react-query";
import { convertN3 } from "@utils/convertor";
import { useAtom } from "jotai";
import { getDefaultThreeObject, threeObjectAtom } from "./atom";
import { useThreeObjectQuery } from "./query";
export default function useThreeObject() {
  const queryClient = useQueryClient();

  const [_threeObject, setThreeObject] = useAtom(threeObjectAtom);
  const [updateRoom, setUpdateRoom] = useAtom(updateRoomAtom);
  const { gltfList } = useGltfList();
  const { addToast } = useToast();
  const { threeObject } = useThreeObjectQuery();
  // item 종류 기록
  const setItemType = ({
    color,
    pamplet_url,
    poster_url,
  }: {
    color: boolean;
    pamplet_url: boolean;
    poster_url: boolean; // item type update
  }) =>
    setThreeObject((prev) => {
      prev.itemType.color = color || false;
      prev.itemType.pamplet_url = pamplet_url || false;
      prev.itemType.poster_url = poster_url || false;
      return {
        ...prev,
      };
    });

  const setColor = (color: { color: string }) => {
    setUpdateRoom((prev) => {
      if (prev.current === null)
        return {
          ...prev,
        };
      prev.current.color = color.color;
      return {
        ...prev,
      };
    });
  };

  const setPampletUrl = (pamplet_url: string) => {
    setUpdateRoom((prev) => {
      if (prev.current === null) return { ...prev };
      prev.current.pamplet_url = pamplet_url;
      return {
        ...prev,
      };
    });
  };

  const setPosterUrl = (poster_url: string) => {
    setUpdateRoom((prev) => {
      if (prev.current === null) return { ...prev };
      prev.current.poster_url = poster_url;
      return {
        ...prev,
      };
    });
  };

  const onThreeObjectUpdate = (id: string) => {
    const toastText = {
      id: "0",
      name: "이름",
    };
    setThreeObject((prev) => {
      if (prev.current === null || _threeObject.current === null) {
        return { ...prev };
      } else {
        prev.update[id] = {
          ...prev.current,
        };
        toastText.id = id.toString();
        toastText.name = prev.update[id].object_name!.toString();
        return {
          ...prev,
        };
      }
    });
  };

  const onThreeObjectCreate = () => {
    const toastText = {
      id: "0",
      name: "이름",
    };
    setThreeObject((prev) => {
      if (updateRoom.current === null) return { ...prev };
      const _id = [updateRoom.current.position].join("_");
      prev.create[_id] = {
        ...getDefaultThreeObject({
          three_object_id: _id,
          object_name: updateRoom.current?.object_name + "_" + _id,
          position: convertN3(updateRoom.current?.position || [0, 0, 0]),
          rotation: convertN3(updateRoom.current?.rotation || [0, 0, 0]),
          scale: convertN3(updateRoom.current?.scale || [1, 1, 1]),
          gltf_url: updateRoom.current?.gltf_url,
          colliders: "cuboid",
          count: [1.0, 1.0, 1.0],
          link_url: updateRoom.current?.link_url,
          npc_id: updateRoom.current?.npc_id,
          color: updateRoom.current?.color || null,
          pamplet_url: updateRoom.current?.pamplet_url || null,
          poster_url: updateRoom.current?.poster_url || null,
        }),
      };
      toastText.id = _id.toString();
      toastText.name = prev.create[_id].object_name!.toString();
      return {
        ...prev,
      };
    });

    addToast({ text: toastText.name + "가 생성되었습니다." });
  };
  const onThreeObjectDelete = (id: string) => {
    setThreeObject((prev) => {
      let text = `${id}를 찾을 수 없습니다.`;
      if (prev.create.hasOwnProperty(id)) {
        delete prev.create[id];
        text = `${id} 생성 취소`;
        return { ...prev };
      } else if (threeObject) {
        const deleteThreeObject = threeObject.find(
          (obj) => obj.three_object_id === id
        );
        if (deleteThreeObject) {
          prev.delete = [...prev.delete, id];
          queryClient.setQueryData(
            ["three_objects"],
            threeObject.filter(
              (obj) =>
                obj.three_object_id &&
                !prev.delete.includes(obj.three_object_id)
            )
          );
          text = `${id}가 임시 삭제되었습니다.`;
        }
      }
      addToast({ text });
      return { ...prev };
    });
  };

  return {
    onThreeObjectCreate,
    onThreeObjectDelete,
    onThreeObjectUpdate,
    setItemType,
    itemType: _threeObject.itemType,
    object_name: updateRoom.current?.object_name,
    threeObject: _threeObject,
    update: _threeObject.update,
    create: _threeObject.create,
    delete: _threeObject.delete,
    threeObjectsById: _threeObject.threeObjectsById,
    current: _threeObject.current,
    updateRoom,
    gltfList,
    queryClient,
    setColor,
    setPampletUrl,
    setPosterUrl,
  };
}
