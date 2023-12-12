import { useMemo, useReducer } from "react";
import { activeStateDefault } from "../../stores/active";
import { animationDefault } from "../../stores/animation";
import {
  airplaneColliderDefault,
  characterColliderDefault,
  vehicleColliderDefault,
} from "../../stores/collider";
import { modeDefault } from "../../stores/context/gaesupworld";
import { gaesupReducer } from "../../stores/context/gaesupworld/reducer";
import { controlDefault } from "../../stores/control";
import { statesDefault } from "../../stores/states";
import { urlDefault } from "../../stores/url";
import { joyStickInnerDefault } from "../../tools/joystick/default";
import { minimapInnerDefault } from "../../tools/minimap/default";
import { V3 } from "../../utils/vector";
import initColider from "./collider";
import { initGaesupWorldPropsType } from "./type";

export default function initGaesupWorld(props: initGaesupWorldPropsType) {
  const [value, dispatch] = useReducer(gaesupReducer, {
    activeState: {
      ...activeStateDefault,
      ...{ position: props.startPosition || V3(0, 2, 5) },
    },
    characterCollider: Object.assign(
      characterColliderDefault,
      props.characterCollider || {}
    ),
    vehicleCollider: Object.assign(
      vehicleColliderDefault,
      props.vehicleCollider || {}
    ),
    airplaneCollider: Object.assign(
      airplaneColliderDefault,
      props.airplaneCollider || {}
    ),
    mode: Object.assign(modeDefault, props.mode || {}),
    url: Object.assign(urlDefault, props.url || {}),
    characterGltf: null,
    vehicleGltf: null,
    wheelGltf: null,
    airplaneGltf: null,
    states: statesDefault,
    debug: false,
    minimap: minimapInnerDefault,
    joystick: joyStickInnerDefault,
    control: controlDefault,
    points: [],
    refs: null,
    animations: animationDefault,
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
