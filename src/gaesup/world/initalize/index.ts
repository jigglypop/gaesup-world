import { useEffect, useMemo, useReducer } from "react";

import { isDesktop } from "react-device-detect";
import { gaesupWorldDefault } from "../../world/context";
import { gaesupWorldReducer } from "../../world/context/reducer";
import initDebug from "../debug";
import { gaesupWorldPropsType } from "../type";

export default function initGaesupWorld(props: gaesupWorldPropsType) {
  const [value, dispatch] = useReducer(gaesupWorldReducer, {
    debug: (props.debug && isDesktop) || gaesupWorldDefault.debug,
    activeState: gaesupWorldDefault.activeState,
    cameraOption: Object.assign(
      gaesupWorldDefault.cameraOption,
      props.cameraOption || {}
    ),
    mode: Object.assign(gaesupWorldDefault.mode, props.mode || {}),
    urls: Object.assign(gaesupWorldDefault.urls, props.urls || {}),
    refs: null,
    states: gaesupWorldDefault.states,
    minimap: gaesupWorldDefault.minimap,
    joystick: gaesupWorldDefault.joystick,
    control: gaesupWorldDefault.control,
    animationState: gaesupWorldDefault.animationState,
    keyBoardMap: Object.assign(
      gaesupWorldDefault.keyBoardMap,
      props.keyBoardMap || {}
    ),
    moveTo: null,
    rideable: gaesupWorldDefault.rideable,
    block: Object.assign(gaesupWorldDefault.block, props.block || {}),
    sizes: gaesupWorldDefault.sizes,
    callback: {
      moveTo: null,
    },
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

  const gaesupProps = useMemo(() => ({ value, dispatch }), [value, dispatch]);
  initDebug({ value, dispatch });
  return {
    gaesupProps,
  };
}
