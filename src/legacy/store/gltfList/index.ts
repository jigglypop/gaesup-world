import useUpdateRoom from "@store/update";
import useThreeObjectType from "@store/update/hooks/objectType";
import { objectTypeString } from "@store/update/type";
import { convertObjectType } from "@utils/object";
import { useAtom } from "jotai";
import { gltfListAtom } from "./atom";
import { gltfListType } from "./type";

export default function useGltfList() {
  const [gltfList, setGltfList] = useAtom(gltfListAtom);
  const { changeObjectType, object_type } = useThreeObjectType();
  const { typeToTag } = convertObjectType();
  const { setCurrentRoom } = useUpdateRoom();

  const selectObjectType = (object_type: objectTypeString) => {
    changeObjectType(object_type);
    if (object_type !== "tile" && object_type !== "wall") {
      updateGltfList(object_type);
    }
  };

  const updateGltfList = (object_type: objectTypeString) => {
    setGltfList((prev) => {
      const category = Object.keys(prev[object_type])[0];
      const gltf_url = prev[object_type][category][0].gltf_url;
      return { ...prev, category, gltf_url };
    });
  };

  const selectGltf = (gltf_url: string) => {
    setGltfList((prev) => ({ ...prev, gltf_url }));
  };

  const selectGltfAndRoom = (item: gltfListType) => {
    selectGltf(item.gltf_url);
    setCurrentRoom({
      gltf_name: item.gltf,
      object_name: item.object_name,
      object_type: object_type,
      count: item.count,
    });
  };

  const selectCategory = (category: string) => {
    setGltfList((prev) => {
      const selected_categories = prev["normal"];
      const selected_category = selected_categories?.[category];
      const gltf_url = selected_category?.[0]?.gltf_url || prev.gltf_url;
      return { ...prev, category, gltf_url };
    });
    selectGltfAndRoom(gltfList[object_type as objectTypeString][category][0]);
  };

  return {
    selectCategory,
    selectObjectType,
    selectGltfAndRoom,
    gltfList,
    tapList: gltfList.tapList,
    toName: gltfList.toName,
    item: {
      wall: gltfList.wall,
      normal: gltfList.normal,
      npc: gltfList.npc,
      tile: gltfList.tile,
      portal: gltfList.portal,
    },
    object_type,
    gltf_url: gltfList.gltf_url,
    category_list: Object.keys(gltfList[object_type as objectTypeString]),
    category: gltfList.category,
    gltfModelList:
      gltfList[object_type as objectTypeString]?.[gltfList.category] || [],
    changeObjectType,
    selectGltf,
    typeToTag,
    npcList: gltfList.npc,
  };
}
