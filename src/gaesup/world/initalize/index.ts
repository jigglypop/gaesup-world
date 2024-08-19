import { useCallback, useEffect, useMemo, useReducer } from "react";
import { isDesktop } from "react-device-detect";
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
    debug: (props.debug && isDesktop) || gaesupWorldDefault.debug,
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

  const initializeKeyboard = useCallback(() => {
    const keyboard = value.keyBoardMap?.reduce((maps, keyboardMapItem) => {
      maps[keyboardMapItem.name] = false;
      return maps;
    }, {});

    // 상태가 변경된 경우에만 업데이트를 수행
    if (JSON.stringify(value.control) !== JSON.stringify(keyboard)) {
      const assignedControl = Object.assign({}, value.control, keyboard);
      dispatch({
        type: "update",
        payload: {
          control: assignedControl,
        },
      });
    }
  }, [value.keyBoardMap, value.control]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => e.preventDefault();
    if (value.block.scroll) {
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
    }
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [value.block.scroll]);

  const gaesupProps = useMemo(() => ({ value, dispatch }), [value, dispatch]);

  return {
    gaesupProps,
  };
}
