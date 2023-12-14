import { useEffect, useMemo, useReducer } from "react";

import { gaesupWorldDefault } from "../../world/context";
import { gaesupWorldReducer } from "../../world/context/reducer";
import initColider from "./collider";
import { initGaesupWorldPropsType } from "./type";

export default function initGaesupWorld(props: initGaesupWorldPropsType) {
  const [value, dispatch] = useReducer(gaesupWorldReducer, {
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
    mode: Object.assign(gaesupWorldDefault.mode, props.mode || {}),
    url: Object.assign(gaesupWorldDefault.url, props.url || {}),
    characterGltf: null,
    vehicleGltf: null,
    wheelGltf: null,
    airplaneGltf: null,
    states: gaesupWorldDefault.states,
    debug: false,
    minimap: gaesupWorldDefault.minimap,
    joystick: gaesupWorldDefault.joystick,
    control: gaesupWorldDefault.control,
    points: [],
    refs: null,
    animations: gaesupWorldDefault.animations,
    keyBoardMap:  gaesupWorldDefault.keyBoardMap,
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
      value.mode,
      value.states,
      value.debug,
      value.minimap,
      value.joystick,
      value.control,
      value.points,
      value.refs,
      value.animations,
      value.activeState,
      dispatch,
    ]
  );
  initColider(value, dispatch);
  return {
    gaesupProps,
  };
}
