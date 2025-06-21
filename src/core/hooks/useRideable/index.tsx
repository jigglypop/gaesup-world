import { CollisionEnterPayload, CollisionExitPayload, euler, vec3 } from '@react-three/rapier';
import { useEffect } from 'react';
import { useGaesupContext, useGaesupDispatch, useGaesupStore } from '@stores/gaesupStore';
import { rideableType } from './types';
import { useGaesupGltf } from '@utils/gltf';

export const rideableDefault: Omit<rideableType, 'objectkey' | 'objectType' | 'url' | 'wheelUrl'> =
  {
    isRiderOn: false,
    position: vec3(),
    rotation: euler(),
    offset: vec3(),
    visible: true,
  };

export function useRideable() {
  const worldContext = useGaesupContext();
  const { states, rideable } = worldContext;
  const dispatch = useGaesupDispatch();
  const { getSizesByUrls } = useGaesupGltf();

  const zustandStates = useGaesupStore((state) => state.states);

  useEffect(() => {
    if (!states || !zustandStates) return;

    if (
      zustandStates.shouldEnterRideable !== states.shouldEnterRideable ||
      zustandStates.shouldExitRideable !== states.shouldExitRideable ||
      zustandStates.canRide !== states.canRide ||
      zustandStates.isRiding !== states.isRiding
    ) {
      dispatch({
        type: 'update',
        payload: {
          states: {
            ...states,
            shouldEnterRideable: zustandStates.shouldEnterRideable,
            shouldExitRideable: zustandStates.shouldExitRideable,
            canRide: zustandStates.canRide,
            isRiding: zustandStates.isRiding,
          },
        },
      });
    }
  }, [dispatch, states, zustandStates]);

  useEffect(() => {
    if (states?.shouldEnterRideable) {
      enterRideable();
      dispatch({
        type: 'update',
        payload: {
          states: { ...states, shouldEnterRideable: false },
        },
      });
    }
  }, [states?.shouldEnterRideable, dispatch, states]);

  useEffect(() => {
    if (states?.shouldExitRideable) {
      exitRideable();
      dispatch({
        type: 'update',
        payload: {
          states: { ...states, shouldExitRideable: false },
        },
      });
    }
  }, [states?.shouldExitRideable, dispatch, states]);

  const initRideable = (props: rideableType) => {
    if (!rideable) return;
    rideable[props.objectkey] = {
      ...rideableDefault,
      ...props,
    };
  };

  const setRideable = (props: rideableType) => {
    if (!rideable) return;
    rideable[props.objectkey] = props;
  };

  const getRideable = (objectkey: string): rideableType | undefined => {
    if (!rideable) return undefined;
    return rideable[objectkey];
  };

  const landing = (objectkey: string) => {
    if (
      !worldContext.states ||
      !worldContext.rideable ||
      !worldContext.activeState ||
      !worldContext.urls ||
      !worldContext.mode
    )
      return;

    const { activeState, refs, states, rideable, urls, mode } = worldContext;

    states.enableRiding = false;
    states.isRiderOn = false;
    states.rideableId = null;

    const rideableItem = rideable[objectkey];
    if (!rideableItem?.position) return;

    const modeType = rideableItem.objectType;
    const { vehicleUrl, airplaneUrl, characterUrl } = getSizesByUrls(urls);
    const size = modeType === 'vehicle' ? vehicleUrl : airplaneUrl;
    const mySize = characterUrl;
    if (!size || !mySize) return;

    rideableItem.visible = true;
    rideableItem.position.copy(activeState.position.clone());
    if (refs?.rigidBodyRef) {
      refs.rigidBodyRef.current.setTranslation(
        activeState.position.clone().add(size.clone().add(mySize.clone()).addScalar(1)),
        false,
      );
    }
    dispatch({
      type: 'update',
      payload: {
        rideable: { ...rideable },
        states: { ...states },
        activeState: { ...activeState },
        mode: { ...mode, type: 'character' },
      },
    });
  };

  const setUrl = async (props: rideableType) => {
    if (!worldContext.urls) return;
    const { urls } = worldContext;
    urls.ridingUrl = props.ridingUrl || urls.characterUrl || undefined;
    if (props.objectType === 'vehicle') {
      urls.vehicleUrl = props.url;
      urls.wheelUrl = props.wheelUrl || undefined;
    } else if (props.objectType === 'airplane') {
      urls.airplaneUrl = props.url;
    }

    dispatch({
      type: 'update',
      payload: {
        urls: {
          ...urls,
        },
      },
    });
  };

  const setModeAndRiding = async (props: rideableType) => {
    if (!worldContext.mode || !worldContext.states || !worldContext.rideable) return;
    const { mode, states, rideable } = worldContext;
    if (!props.objectType) return;
    mode.type = props.objectType;
    states.enableRiding = props.enableRiding ?? false;
    states.isRiderOn = true;
    states.rideableId = props.objectkey;
    const rideableItem = rideable[props.objectkey];
    if (!rideableItem) return;
    rideableItem.visible = false;
    dispatch({
      type: 'update',
      payload: {
        mode: { ...mode },
        states: { ...states },
      },
    });
  };

  const onRideableNear = async (e: CollisionEnterPayload, props: rideableType) => {
    if (!worldContext.states) return;
    const { states } = worldContext;
    const isCharacterCollision =
      (e.other.rigidBodyObject && e.other.rigidBodyObject.name === 'character') ||
      (e.other.rigidBodyObject && !e.other.rigidBodyObject.name) ||
      e.other.rigidBody;
    if (isCharacterCollision && !states.isRiding) {
      if (!props.objectType) return;
      states.nearbyRideable = {
        objectkey: props.objectkey,
        objectType: props.objectType,
        name: props.objectType === 'vehicle' ? '차량' : '비행기',
        rideMessage: props.rideMessage,
        exitMessage: props.exitMessage,
        displayName: props.displayName,
      };
      states.canRide = true;
      dispatch({
        type: 'update',
        payload: {
          states: { ...states },
        },
      });
    }
  };

  const onRideableLeave = async (e: CollisionExitPayload) => {
    if (!worldContext.states) return;
    const { states } = worldContext;
    const isCharacterCollision =
      (e.other.rigidBodyObject && e.other.rigidBodyObject.name === 'character') ||
      (e.other.rigidBodyObject && !e.other.rigidBodyObject.name) ||
      e.other.rigidBody;

    if (isCharacterCollision) {
      states.nearbyRideable = null;
      states.canRide = false;
      dispatch({
        type: 'update',
        payload: {
          states: { ...states },
        },
      });
    }
  };

  const enterRideable = async () => {
    if (!worldContext.states || !worldContext.rideable) return;
    const { states, rideable } = worldContext;
    if (states.canRide && states.nearbyRideable && !states.isRiding) {
      const rideableData = rideable[states.nearbyRideable.objectkey];
      if (rideableData) {
        await setUrl(rideableData);
        await setModeAndRiding(rideableData);
        states.canRide = false;
        states.nearbyRideable = null;
        dispatch({
          type: 'update',
          payload: {
            states: { ...states },
          },
        });
      }
    }
  };

  const exitRideable = async () => {
    if (!worldContext.states) return;
    const { states } = worldContext;
    if (states.isRiding && states.rideableId) {
      landing(states.rideableId);
    }
  };

  const ride = async (e: CollisionEnterPayload, props: rideableType) => {
    await onRideableNear(e, props);
  };

  return {
    initRideable,
    setRideable,
    getRideable,
    ride,
    onRideableNear,
    onRideableLeave,
    enterRideable,
    exitRideable,
    landing,
  };
}
