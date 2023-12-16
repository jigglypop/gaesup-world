import { dispatchType } from "../../utils/type";
import { gaesupWorldContextType } from "../context/type";
import { getGltfResultType } from "./collider/gltf";

export type innerColliderPropType = {
  gltf?: getGltfResultType;
  value: gaesupWorldContextType;
  dispatch: dispatchType<gaesupWorldContextType>;
};

export type innerDebugPropType = {
  gltf?: getGltfResultType;
  value: gaesupWorldContextType;
  dispatch: dispatchType<gaesupWorldContextType>;
};
