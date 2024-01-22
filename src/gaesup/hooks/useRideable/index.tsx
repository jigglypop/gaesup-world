import { CollisionEnterPayload, euler, vec3 } from "@react-three/rapier";
import { useContext } from "react";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { rideableType } from "../../world/context/type";
import { useGaesupGltf } from "../useGaesupGltf";

/**
 * Default rideable object properties.
 * @type {Object}
 */
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

/**
 * Custom hook for managing rideable objects.
 * @returns {Object} An object containing functions to initialize, set, get, ride, and land rideable objects.
 */
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

  /**
   * Initialize a rideable object with the provided properties.
   * @param {rideableType} props - The properties of the rideable object to initialize.
   */
  const initRideable = (props: rideableType) => {
    rideable[props.objectkey] = {
      ...rideableDefault,
      ...props,
    };
  };

  /**
   * Set the properties of a rideable object.
   * @param {rideableType} props - The properties to set for the rideable object.
   */
  const setRideable = (props: rideableType) => {
    rideable[props.objectkey] = props;
  };

  /**
   * Get the rideable object with the specified object key.
   * @param {string} objectkey - The key of the rideable object to retrieve.
   * @returns {rideableType} The rideable object with the specified key.
   */
  const getRideable = (objectkey: string): rideableType => {
    return rideable[objectkey];
  };

  /**
   * Handle landing of a rideable object.
   * @param {string} objectkey - The key of the rideable object to land.
   */
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

    dispatch({
      type: "update",
      payload: {
        rideable: { ...rideable },
        states: { ...states },
        activeState: { ...activeState },
      },
    });
  };

  /**
   * Set the URL properties of a rideable object. (inner function)
   * @param {rideableType} props - The properties containing URLs for the rideable object.
   */
  const setUrl = async (props: rideableType) => {
    if (props.objectType === "vehicle") {
      urls.vehicleUrl = props.url;
      urls.wheelUrl = props.wheelUrl || null;
    } else if (props.objectType === "airplane") {
      urls.airplaneUrl = props.url;
    }
    dispatch({
      type: "update",
      payload: {
        urls: {
          ...urls,
        },
      },
    });
  };

  /**
   * Set the mode and riding state for a rideable object. (inner function)
   * @param {rideableType} props - The properties of the rideable object to set mode and riding state.
   */
  const setModeAndRiding = async (props: rideableType) => {
    mode.type = props.objectType;
    states.enableRiding = props.enableRiding;
    states.isRiderOn = true;
    states.rideableId = props.objectkey;
    rideable[props.objectkey].visible = false;
    dispatch({
      type: "update",
      payload: {
        mode: { ...mode },
        states: { ...states },
      },
    });
  };

  /**
   * Handle the ride event for a rideable object.
   * @param {CollisionEnterPayload} e - The collision event payload.
   * @param {rideableType} props - The properties of the rideable object.
   */
  const ride = async (e: CollisionEnterPayload, props: rideableType) => {
    if (e.other.rigidBodyObject.name === "character") {
      await setUrl(props);
      await setModeAndRiding(props);
    }
  };

  return {
    initRideable,
    setRideable,
    getRideable,
    ride,
    landing,
  };
}
