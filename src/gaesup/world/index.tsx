import { useMemo, useReducer } from "react";
import {
  airplaneColliderDefault,
  characterColliderDefault,
  vehicleColliderDefault,
} from "../stores/collider";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
  gaesupReducer,
  optionDefault,
} from "../stores/context";
import { statesDefault } from "../stores/states";
import { urlDefault } from "../stores/url";
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
    states: statesDefault,
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
      value.states,
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
