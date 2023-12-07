import { vec3 } from "@react-three/rapier";
import { calcPropType } from "..";

export default function currentSetting(prop: calcPropType) {
  const { rigidBodyRef } = prop;
  const [_, setCurrent] = prop.current;
  setCurrent((current) => ({
    ...current,
    position: vec3(rigidBodyRef.current!.translation()),
    velocity: vec3(rigidBodyRef.current!.linvel()),
  }));
}
