import { CollisionEnterPayload, euler, vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { V3 } from "../../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context";
import { rideableType } from "../../world/context/type";

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
export function useRideable() {
  const worldContext = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  /**
   * Initialize a rideable object with the provided properties.
   * @param {rideableType} props - The properties of the rideable object to initialize.
   */
  const initRideable = (props: rideableType) => {
    worldContext.rideable[props.objectkey] = {
      ...rideableDefault,
      ...props,
    };
  };

  /**
   * Set the properties of a rideable object.
   * @param {rideableType} props - The properties to set for the rideable object.
   */
  const setRideable = (props: rideableType) => {
    worldContext.rideable[props.objectkey] = props;
  };

  /**
   * Get the rideable object with the specified object key.
   * @param {string} objectkey - The key of the rideable object to retrieve.
   * @returns {rideableType} The rideable object with the specified key.
   */
  const getRideable = (objectkey: string): rideableType => {
    return worldContext.rideable[objectkey];
  };

  /**
   * Handle landing of a rideable object.
   * @param {string} objectkey - The key of the rideable object to land.
   */
  const landing = (objectkey: string) => {
    const { activeState, vehicleCollider, airplaneCollider } = worldContext;
    worldContext.characterCollider.riderOffsetX = 0;
    worldContext.characterCollider.riderOffsetY = 0;
    worldContext.characterCollider.riderOffsetZ = 0;
    worldContext.states.isRiding = false;
    worldContext.rideable[objectkey].visible = true;
    worldContext.rideable[objectkey].position.copy(
      activeState.position
        .clone()
        .add(
          worldContext.rideable[objectkey].objectType === "vehicle"
            ? V3(
                vehicleCollider.vehicleSizeX,
                vehicleCollider.vehicleSizeY,
                vehicleCollider.vehicleSizeZ
              ).multiplyScalar(1.5)
            : V3(
                airplaneCollider.airplaneSizeX,
                airplaneCollider.airplaneSizeY,
                airplaneCollider.airplaneSizeZ
              ).multiplyScalar(1.5)
        )
    );
    worldContext.rideable[objectkey].rotation.copy(activeState.euler.clone());
    dispatch({
      type: "update",
      payload: {
        rideable: { ...worldContext.rideable },
        states: { ...worldContext.states },
        characterCollider: { ...worldContext.characterCollider },
      },
    });
  };

  /**
   * Set the URL properties of a rideable object. (inner function)
   * @param {rideableType} props - The properties containing URLs for the rideable object.
   */
  const setUrl = async (props: rideableType) => {
    if (props.objectType === "vehicle") {
      worldContext.url.vehicleUrl = props.url;
      worldContext.url.wheelUrl = props.wheelUrl || null;
    } else if (props.objectType === "airplane") {
      worldContext.url.airplaneUrl = props.url;
    }
    dispatch({
      type: "update",
      payload: {
        url: {
          ...worldContext.url,
        },
      },
    });
  };

  /**
   * Set the mode and riding state for a rideable object. (inner function)
   * @param {rideableType} props - The properties of the rideable object to set mode and riding state.
   */
  const setModeAndRiding = async (props: rideableType) => {
    worldContext.mode.type = props.objectType;
    worldContext.states.isRiding = true;
    worldContext.states.isRiderOn = props.isRiderOn;
    worldContext.characterCollider.riderOffsetX = props?.offset?.x || 0;
    worldContext.characterCollider.riderOffsetY = props?.offset?.y || 0;
    worldContext.characterCollider.riderOffsetZ = props?.offset?.z || 0;
    worldContext.rideable[props.objectkey].visible = false;

    dispatch({
      type: "update",
      payload: {
        mode: { ...worldContext.mode },
        states: { ...worldContext.states },
        characterCollider: { ...worldContext.characterCollider },
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
