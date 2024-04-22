import { CollisionEnterPayload, euler, vec3 } from "@react-three/rapier";
import { useContext } from "react";
import * as THREE from "three";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { useGaesupGltf } from "../useGaesupGltf";

export const rideableDefault = {
  objectkey: null,
  objectType: null,
  isRiderOn: false,
  url: null,
  wheelUrl: null,
  position: vec3(),
  rotation: euler(),
  offset: vec3(),
  visible: true,
};

export type rideableType = {
  objectkey: string;
  objectType?: "vehicle" | "airplane";
  enableRiding?: boolean;
  isRiderOn?: boolean;
  url?: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  offset?: THREE.Vector3;
  landingOffset?: THREE.Vector3;
  visible?: boolean;
  vehicleSize?: THREE.Vector3;
  wheelSize?: THREE.Vector3;
  airplaneSize?: THREE.Vector3;
};

export function useRideable(): {
  initRideable: (props: rideableType) => void;
  setRideable: (props: rideableType) => void;
  getRideable: (objectkey: string) => rideableType;
  ride: (e: CollisionEnterPayload, props: rideableType) => Promise<void>;
  landing: (objectkey: string) => void;
} {
  const worldContext = useContext(GaesupWorldContext);
  const { urls, states, rideable, mode } = worldContext;
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { getSizesByUrls } = useGaesupGltf();

  const initRideable = (props: rideableType) => {
    rideable[props.objectkey] = {
      ...rideableDefault,
      ...props,
    };
  };

  const setRideable = (props: rideableType) => {
    rideable[props.objectkey] = props;
  };

  const getRideable = (objectkey: string): rideableType => {
    return rideable[objectkey];
  };

  const landing = (objectkey: string) => {
    const { activeState, refs } = worldContext;
    states.enableRiding = false;
    states.isRiderOn = false;
    states.rideableId = null;
    const modeType = rideable[objectkey].objectType;
    const { vehicleUrl, airplaneUrl, characterUrl } = getSizesByUrls(urls);
    const size = modeType === "vehicle" ? vehicleUrl : airplaneUrl;
    const mySize = characterUrl;
    rideable[objectkey].visible = true;
    rideable[objectkey].position.copy(activeState.position.clone());
    if (refs && refs.rigidBodyRef) {
      refs.rigidBodyRef.current.setTranslation(
        activeState.position
          .clone()
          .add(size.clone().add(mySize.clone()).addScalar(1)),
        false
      );
    }

    // dispatch({
    //   type: "update",
    //   payload: {
    //     rideable: { ...rideable },
    //     states: { ...states },
    //     activeState: { ...activeState },
    //   },
    // });
  };

  const setUrl = async (props: rideableType) => {
    if (props.objectType === "vehicle") {
      urls.vehicleUrl = props.url;
      urls.wheelUrl = props.wheelUrl || null;
    } else if (props.objectType === "airplane") {
      urls.airplaneUrl = props.url;
    }
    // dispatch({
    //   type: "update",
    //   payload: {
    //     urls: {
    //       ...urls,
    //     },
    //   },
    // });
  };

  const setModeAndRiding = async (props: rideableType) => {
    mode.type = props.objectType;
    states.enableRiding = props.enableRiding;
    states.isRiderOn = true;
    states.rideableId = props.objectkey;
    rideable[props.objectkey].visible = false;
    // dispatch({
    //   type: "update",
    //   payload: {
    //     mode: { ...mode },
    //     states: { ...states },
    //   },
    // });
  };

  const ride = async (e: CollisionEnterPayload, props: rideableType) => {
    // if (e.other.rigidBodyObject.name === "character") {
    //   await setUrl(props);
    //   await setModeAndRiding(props);
    // }
  };

  return {
    initRideable,
    setRideable,
    getRideable,
    ride,
    landing,
  };
}
