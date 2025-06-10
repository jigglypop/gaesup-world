import * as THREE from "three";

export const convertGroupProps = (objects: any[]) => {
  objects = objects.map((object) => {
    const _position = object.position as THREE.Vector3;
    const _rotation = object.rotation as THREE.Euler;
    object.position = [
      parseFloat(_position.x?.toString() || "") || 0.0,
      parseFloat(_position.y?.toString() || "") || 0.0,
      parseFloat(_position.z?.toString() || "") || 0.0,
    ] as unknown as THREE.Vector3;
    object.rotation = [
      parseFloat(_rotation.x?.toString() || "") || 0.0,
      parseFloat(_rotation.y?.toString() || "") || 0.0,
      parseFloat(_rotation.z?.toString() || "") || 0.0,
    ] as unknown as THREE.Euler;
    object.scale = object.scale || [1.0, 1.0, 1.0];
    return object;
  });
  return objects;
};

const objectTypeMap = {
  tile: "타일",
  wall: "벽",
  normal: "일반",
  npc: "npc",
  portal: "포탈",
};

export const convertObjectType = () => {
  const typeToTag = (tag: keyof typeof objectTypeMap) => {
    return objectTypeMap[tag];
  };
  const tagToType = (type: string) => {
    return Object.keys(objectTypeMap).find(
      (tag) => objectTypeMap[tag as keyof typeof objectTypeMap] === type
    );
  };
  return { typeToTag, tagToType };
};
