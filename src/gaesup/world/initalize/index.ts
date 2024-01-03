import { useEffect, useMemo, useReducer } from "react";

import { gaesupWorldDefault } from "../../world/context";
import { gaesupWorldReducer } from "../../world/context/reducer";
import initDebug from "../debug";
import { gaesupWorldPropsType } from "../type";
import initColider from "./collider";

export default function initGaesupWorld(props: gaesupWorldPropsType) {
  const [value, dispatch] = useReducer(gaesupWorldReducer, {
    debug: props.debug || gaesupWorldDefault.debug,
    activeState: gaesupWorldDefault.activeState,
    characterCollider: Object.assign(
      gaesupWorldDefault.characterCollider,
      props.characterCollider || {}
    ),
    vehicleCollider: Object.assign(
      gaesupWorldDefault.vehicleCollider,
      props.vehicleCollider || {}
    ),
    airplaneCollider: Object.assign(
      gaesupWorldDefault.airplaneCollider,
      props.airplaneCollider || {}
    ),
    cameraOption: Object.assign(
      gaesupWorldDefault.cameraOption,
      props.cameraOption || {}
    ),
    mode: Object.assign(gaesupWorldDefault.mode, props.mode || {}),
    url: Object.assign(gaesupWorldDefault.url, props.url || {}),
    characterGltf: null,
    vehicleGltf: null,
    wheelGltf: null,
    airplaneGltf: null,
    refs: null,
    states: gaesupWorldDefault.states,
    minimap: gaesupWorldDefault.minimap,
    joystick: gaesupWorldDefault.joystick,
    control: gaesupWorldDefault.control,
    animations: gaesupWorldDefault.animations,
    keyBoardMap: gaesupWorldDefault.keyBoardMap,
    moveTo: null,
    cameraBlock: props.cameraBlock || false,
    controlBlock: props.controlBlock || false,
  });

  useEffect(() => {
    const keyboard = value.keyBoardMap?.reduce((maps, keyboardMapItem) => {
      maps[keyboardMapItem.name] = false;
      return maps;
    }, {});
    const assignedControl = Object.assign(value.control, keyboard);

    dispatch({
      type: "update",
      payload: {
        control: {
          ...assignedControl,
        },
      },
    });
  }, []);

  const gaesupProps = useMemo(() => ({ value, dispatch }), [value, dispatch]);
  initColider({ value, dispatch });
  initDebug({ value, dispatch });
  return {
    gaesupProps,
  };
}
