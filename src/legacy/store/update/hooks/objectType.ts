import { meshTypeString } from "@store/mesh/type";
import { defaultNpc } from "@store/npc/atom";
import { threeObjectType } from "@store/threeObject/type";
import { getDefaultMesh } from "@store/tileParent/atom";
import { Elr, V30 } from "gaesup-world";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { updateRoomAtom } from "../atom";
import { currentRoomType, objectTypeString } from "../type";

export const defaultWall: currentRoomType = {
  gltf_name: "wall_I.glb",
  object_name: "벽 I",
  color: "rgb(0, 0, 0)",
  count: [0, 0, 0],
  object_type: "wall",
  position: V30(),
  rotation: Elr(0, 0, 0),
  scale: [1, 1, 1],
};

export const defaultNormal: currentRoomType = {
  gltf_name: "chair.glb",
  object_name: "의자",
  color: "rgb(0, 0, 0)",
  count: [0, 0, 0],
  object_type: "normal",
  position: V30(),
  rotation: Elr(0, 0, 0),
  scale: [1, 1, 1],
};

export const defaultCurrentObject: {
  [key in objectTypeString]: any;
} = {
  wall: defaultWall,
  normal: defaultNormal,
  npc: defaultNpc,
  tile: defaultWall,
  portal: {},
};

export const convertObject = (object_type: objectTypeString) => {
  const defaults = defaultCurrentObject[object_type];
  const current: threeObjectType = {
    ...defaults,
    three_object_id: "-1",
    gltf_url: "gltf/" + defaults.gltf_name,
    colliders: defaults.collider || "cuboid",
    object_type: object_type,
    object_name: "normal",
    count: [1.0, 1.0, 1.0],
    position: [0.0, 0.0, 0.0],
    rotation: [0.0, Math.PI * 2, 0.0],
    direction: "S",
    scale: [1.0, 1.0, 1.0],
    rigid_body_type: defaults.rigid_body_type || "fixed",
    link_url: null,
    meshes: [getDefaultMesh("normal" as meshTypeString)],
    npc_id: null,
  };
  return current;
};

export default function useThreeObjectType() {
  const [updateRoom, setUpdateRoom] = useAtom(updateRoomAtom);

  const changeObjectType = useCallback((object_type: objectTypeString) => {
    setUpdateRoom((prev) => {
      prev.object_type = object_type;
      prev.current = convertObject(object_type);

      return {
        ...prev,
      };
    });
  }, []);

  return {
    changeObjectType,
    object_type: updateRoom.object_type,
  };
}
