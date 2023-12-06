import { useMemo, useReducer } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
  airplaneColliderDefault,
  characterColliderDefault,
  gaesupReducer,
  optionDefault,
  urlDefault,
  vehicleColliderDefault,
} from "../stores/context";
import initProp from "./prop";
import { gaesupWorldPropsType } from "./type";

export default function GaesupWorld({
  children,
  characterCollider,
  vehicleCollider,
  airplaneCollider,
  option,
  url,
}: gaesupWorldPropsType) {
  const [value, dispatch] = useReducer(gaesupReducer, {
    characterCollider: Object.assign(
      characterColliderDefault,
      characterCollider || {}
    ),
    vehicleCollider: Object.assign(
      vehicleColliderDefault,
      vehicleCollider || {}
    ),
    airplaneCollider: Object.assign(
      airplaneColliderDefault,
      airplaneCollider || {}
    ),
    option: Object.assign(optionDefault, option || {}),
    url: Object.assign(urlDefault, url || {}),
    characterGltf: null,
    vehicleGltf: null,
    wheelGltf: null,
    airplaneGltf: null,
  });

  const gaesupProps = useMemo(
    () => ({ value, dispatch }),
    [
      value.characterCollider,
      value.vehicleCollider,
      value.airplaneCollider,
      value.airplaneGltf,
      value.vehicleGltf,
      value.wheelGltf,
      value.url,
      value.option,
      dispatch,
    ]
  );
  initProp(gaesupProps.value, gaesupProps.dispatch);
  return (
    <GaesupWorldContext.Provider value={gaesupProps.value}>
      <GaesupWorldDispatchContext.Provider value={gaesupProps.dispatch}>
        {children}
      </GaesupWorldDispatchContext.Provider>
    </GaesupWorldContext.Provider>
  );
}
