import { CollisionEnterPayload, CollisionExitPayload, euler, vec3 } from '@react-three/rapier';
import { useEffect, useRef } from 'react';
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

const createRideableUI = () => {
  const ui = document.createElement('div');
  ui.id = 'rideable-ui';
  ui.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    font-family: Arial, sans-serif;
    font-size: 16px;
    z-index: 1000;
    display: none;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  `;
  document.body.appendChild(ui);
  return ui;
};

export function useRideable() {
  const worldContext = useGaesupContext();
  const { states, rideable } = worldContext;
  const dispatch = useGaesupDispatch();
  const { getSizesByUrls } = useGaesupGltf();
  const uiRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let ui = document.getElementById('rideable-ui');
    if (!ui) {
      ui = createRideableUI();
    }
    uiRef.current = ui;

    return () => {
      if (uiRef.current && document.body.contains(uiRef.current)) {
        document.body.removeChild(uiRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!uiRef.current) return;
    if (states?.canRide && states?.nearbyRideable) {
      uiRef.current.innerHTML = `🚗 E키를 눌러 ${states.nearbyRideable.name}에 탑승하세요`;
      uiRef.current.style.display = 'block';
    } else if (states?.isRiding) {
      uiRef.current.innerHTML = `🚗 R키를 눌러 하차하세요`;
      uiRef.current.style.display = 'block';
    } else {
      uiRef.current.style.display = 'none';
    }
  }, [states?.canRide, states?.nearbyRideable, states?.isRiding]);

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
    console.log(
      '[useRideable] Collision detected:',
      e.other.rigidBodyObject?.name,
      'props:',
      props.objectType,
    );
    console.log('[useRideable] Collision object type:', e.other.rigidBodyObject?.userData);

    if (!worldContext.states) return;
    const { states } = worldContext;

    // character인지 확인하는 조건을 더 유연하게 변경
    const isCharacterCollision =
      (e.other.rigidBodyObject && e.other.rigidBodyObject.name === 'character') ||
      (e.other.rigidBodyObject && !e.other.rigidBodyObject.name) || // name이 없는 경우도 허용
      e.other.rigidBody; // rigidBody가 있으면 character로 간주

    if (isCharacterCollision && !states.isRiding) {
      console.log('[useRideable] Setting up rideable near state for:', props.objectType);

      if (!props.objectType) return;
      states.nearbyRideable = {
        objectkey: props.objectkey,
        objectType: props.objectType,
        name: props.objectType === 'vehicle' ? '차량' : '비행기',
      };
      states.canRide = true;

      console.log(
        '[useRideable] States updated - canRide:',
        states.canRide,
        'nearbyRideable:',
        states.nearbyRideable,
      );

      dispatch({
        type: 'update',
        payload: {
          states: { ...states },
        },
      });
    }
  };

  const onRideableLeave = async (e: CollisionExitPayload) => {
    console.log('[useRideable] Collision exit detected:', e.other.rigidBodyObject?.name);

    if (!worldContext.states) return;
    const { states } = worldContext;

    // character인지 확인하는 조건을 더 유연하게 변경
    const isCharacterCollision =
      (e.other.rigidBodyObject && e.other.rigidBodyObject.name === 'character') ||
      (e.other.rigidBodyObject && !e.other.rigidBodyObject.name) ||
      e.other.rigidBody;

    if (isCharacterCollision) {
      console.log('[useRideable] Clearing rideable state');

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
      } else {
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
