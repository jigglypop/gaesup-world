import useModal from "@store/modal";
import { directionEnumType } from "@store/threeObject/type";
import { useToast } from "@store/toast";
import { convertN3 } from "@utils/convertor";
import { Elr, V3 } from "gaesup-world";
import { useAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { ChangeEvent, useCallback } from "react";
import * as THREE from "three";
import { resetUpdateRoomAtom, updateRoomAtom } from "./atom";
import {
  useSaveNpc,
  useSavePortal,
  useSaveThreeObjects,
  useSaveTile,
  useSaveWall,
} from "./query";
import {
  currentRoomType,
  n3,
  objectTypeString,
  updateRoomAtomType,
} from "./type";
export default function useUpdateRoom() {
  const [updateRoom, setUpdateRoom] = useAtom(updateRoomAtom);
  const resetUpdateRoom = useResetAtom(resetUpdateRoomAtom);
  const { addToastAsync } = useToast();
  const { closeModal } = useModal();
  const { saveNpcs } = useSaveNpc();
  const { saveThreeObjects } = useSaveThreeObjects();
  const { saveTiles } = useSaveTile();
  const { saveWalls } = useSaveWall();
  const { savePortals } = useSavePortal();

  const setPositionDelta = useCallback(
    (axis: "x" | "y" | "z", value: number) => {
      setUpdateRoom((prev) => {
        if (prev.current === null) return { ...prev };
        const currentPosition = prev.current.position || [1, 1, 1];
        switch (axis) {
          case "x":
            currentPosition[0] = value;
            break;
          case "y":
            currentPosition[1] = value * 4;
            break;
          case "z":
            currentPosition[2] = value;
            break;
        }
        prev.current.position = [...currentPosition];

        return { ...prev };
      });
    },
    [setUpdateRoom]
  );

  const setScale = useCallback(
    (axis: "x" | "y" | "z", value: number) => {
      setUpdateRoom((prev) => {
        if (prev.current === null) return { ...prev };
        const currentScale = prev.current.scale || [1, 1, 1];
        switch (axis) {
          case "x":
            currentScale[0] = value;
            break;
          case "y":
            currentScale[1] = value;
            break;
          case "z":
            currentScale[2] = value;
            break;
        }
        prev.current.scale = [...currentScale];
        return {
          ...prev,
        };
      });
    },
    [setUpdateRoom]
  );

  const _updateRoom = (prevItem: Partial<updateRoomAtomType>) => {
    setUpdateRoom((prev) => {
      if (prev.current === null) return { ...prev };
      return {
        ...prev,
        ...prevItem,
      };
    });
  };

  const closeCurrent = useCallback(() => {
    _updateRoom({ current: null });
  }, [_updateRoom]);

  const setCount = useCallback(
    ({ i, e }: { i: number; e: ChangeEvent<HTMLInputElement> }) => {
      const count: n3 = [1, 1, 1];
      count[i] = Math.floor(parseInt(e.target.value));
      const scale: n3 = [count[0], 1, count[2]];

      setUpdateRoom((prev) => {
        if (prev.current === null) return { ...prev };
        prev.current.scale = scale;
        return {
          ...prev,
        };
      });
    },
    [setUpdateRoom]
  );

  const saveRoomAll = async (object_type: objectTypeString) => {
    switch (object_type) {
      case "normal":
        await saveThreeObjects();
        break;
      case "npc":
        await saveNpcs();
        break;
      case "tile":
        await saveTiles();
        break;
      case "wall":
        await saveWalls();
        break;
      case "portal":
        await savePortals();
        break;
    }
    closeModal();
    await addToastAsync({ text: "저장되었습니다." });
  };

  const toggleOption = useCallback(() => {
    setUpdateRoom((prev) => {
      prev.option.turn = !prev.option.turn;
      prev.option.move = !prev.option.move;
      return {
        ...prev,
      };
    });
  }, [setUpdateRoom]);

  const setHeight = useCallback(
    ({ height }: { height: number }) => {
      setUpdateRoom((prev) => {
        if (prev.current === null) return { ...prev };
        prev.height = height;
        return { ...prev };
      });
    },
    [setUpdateRoom]
  );

  const setPosition = useCallback(
    ({ position }: { position: [number, number, number] }) => {
      if (!updateRoom.option.move) return;
      setUpdateRoom((prev) => {
        if (prev.current === null) return { ...prev };
        const _position = V3(...(prev.current.position || [0.0, 0.0, 0.0]));
        const _position_v3 = _position.addVectors(
          V3(0.0, 0.0 + prev.height * 4, 0.0),
          updateRoom.option.move ? V3(...position) : V3(0.0, 0.0, 0.0)
        );
        prev.current.position = convertN3(_position_v3);
        return { ...prev };
      });
    },
    [setUpdateRoom, updateRoom.option]
  );

  const setRotation = useCallback(
    ({ rotation }: { rotation: THREE.Euler }) => {
      if (!updateRoom.option.turn) return;
      setUpdateRoom((prev) => {
        if (prev.current === null) return { ...prev };
        prev.current.rotation = convertN3(rotation.clone());
        return { ...prev };
      });
    },
    [setUpdateRoom, updateRoom.option]
  );

  const setDirection = useCallback(
    ({ y, direction }: { y: number; direction: directionEnumType }) => {
      setUpdateRoom((prev) => {
        if (prev.current === null) return { ...prev };
        prev.option.turn = false;
        prev.option.move = true;
        prev.current.rotation = convertN3(Elr(0, y, 0));
        prev.current.direction = direction;
        return { ...prev };
      });
    },
    [setUpdateRoom]
  );

  const setCurrentRoom = useCallback(
    (props: Partial<currentRoomType>) => {
      const id =
        Math.max(
          Object.keys(updateRoom.create).length !== 0
            ? Math.max(...Object.keys(updateRoom.create).map(Number))
            : 1
        ) + 2;

      setUpdateRoom((prev) => {
        prev.type = "create";
        props.count = props.count || [1, 1, 1];
        props.object_type = props.object_type || "normal";
        return {
          ...prev,
          type: "create",
          current: {
            ...props,
            three_object_id: id.toString(),
            colliders: props.collider || "cuboid",
            gltf_url: "gltf/" + props.gltf_name,
            object_type: props.object_type,
            object_name: props.object_name || "익명 객체",
            rigid_body_type: props.rigid_body_type || "fixed",
            position: convertN3(V3(0, 0, 0)),
            rotation: convertN3(Elr(0.0, Math.PI * 2, 0.0)),
            scale: [1.0, 1.0, 1.0],
            direction: "S",
            count: props.count,
            link_url: null,
            npc_id: null,
            color: null,
            pamplet_url: null,
            poster_url: null,
            meshes: [],
            collideable: true,
          },
        };
      });
    },
    [setUpdateRoom]
  );

  return {
    current: updateRoom.current,
    updateRoom,
    setUpdateRoom,
    setCurrentRoom,
    setPosition,
    setRotation,
    toggleOption,
    saveRoomAll,
    setDirection,
    setCount,
    closeCurrent,
    resetUpdateRoom,
    object_type: updateRoom.object_type,
    setHeight,
    setPositionDelta,
    setScale,
  };
}
