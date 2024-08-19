import { useEffect, useMemo, useReducer } from "react";

import { gaesupWorldDefault } from "../../world/context";
import { gaesupWorldReducer } from "../../world/context/reducer";
import { gaesupWorldPropsType } from "../type";

export default function initGaesupWorld(props: gaesupWorldPropsType) {
  const [value, dispatch] = useReducer(gaesupWorldReducer, {
    activeState: {
      ...gaesupWorldDefault.activeState,
      position: props.startPosition || gaesupWorldDefault.activeState.position,
    },
    cameraOption: Object.assign(
      gaesupWorldDefault.cameraOption,
      props.cameraOption || {}
    ),
    mode: Object.assign(gaesupWorldDefault.mode, props.mode || {}),
    urls: Object.assign(gaesupWorldDefault.urls, props.urls || {}),
    refs: null,
    states: gaesupWorldDefault.states,
    rideable: gaesupWorldDefault.rideable,
    minimap: gaesupWorldDefault.minimap,
    joystick: gaesupWorldDefault.joystick,
    control: gaesupWorldDefault.control,
    clicker: gaesupWorldDefault.clicker,
    clickerOption: Object.assign(
      gaesupWorldDefault.clickerOption,
      props.clickerOption || {}
    ),
    animationState: gaesupWorldDefault.animationState,
    keyBoardMap: Object.assign(
      gaesupWorldDefault.keyBoardMap,
      props.keyBoardMap || {}
    ),

    block: Object.assign(gaesupWorldDefault.block, props.block || {}),
    sizes: gaesupWorldDefault.sizes,
  });

  useEffect(() => {
    const keyboard = value.keyBoardMap?.reduce((maps, keyboardMapItem) => {
      maps[keyboardMapItem.name] = false;
      return maps;
    }, {});
    const assignedControl = Object.assign(value.control, keyboard);
    if (value.block.scroll)
      window.addEventListener("touchmove", (e) => e.preventDefault(), {
        passive: false,
      });
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
    () => ({ value: value, dispatch }),
    [value, value.block, dispatch]
  );

  return {
    gaesupProps,
  };
}