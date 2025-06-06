import { CollisionEnterPayload, CollisionExitPayload, euler, vec3 } from '@react-three/rapier';
import { useContext, useEffect } from 'react';
import { physicsEventBus } from '../../physics/stores/physicsEventBus';
import { GaesupContext, GaesupDispatchContext } from '../../context';
import { useGaesupGltf } from '../useGaesupGltf';
import { rideableType } from './type';

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

export function useRideable() {
  const worldContext = useContext(GaesupContext);
  const { urls, states, rideable, mode } = worldContext;
  const dispatch = useContext(GaesupDispatchContext);
  const { getSizesByUrls } = useGaesupGltf();

  // physicsEventBus의 RIDE_STATE_CHANGE 이벤트 구독
  useEffect(() => {
    const unsubscribe = physicsEventBus.subscribe('RIDE_STATE_CHANGE', (data) => {
      dispatch({
        type: 'update',
        payload: {
          states: {
            ...states,
            shouldEnterRideable: data.shouldEnterRideable,
            shouldExitRideable: data.shouldExitRideable,
            canRide: data.canRide,
            isRiding: data.isRiding,
          },
        },
      });
    });

    return unsubscribe;
  }, [dispatch, states]); // states 다시 추가

  // 플래그 감지 및 자동 처리
  useEffect(() => {
    if (states.shouldEnterRideable) {
      console.log('🚗 탑승 플래그 감지! enterRideable 호출');
      enterRideable();
      // 플래그 리셋
      dispatch({
        type: 'update',
        payload: {
          states: { ...states, shouldEnterRideable: false },
        },
      });
    }
  }, [states.shouldEnterRideable]);

  useEffect(() => {
    if (states.shouldExitRideable) {
      console.log('🚪 하차 플래그 감지! exitRideable 호출');
      exitRideable();
      // 플래그 리셋
      dispatch({
        type: 'update',
        payload: {
          states: { ...states, shouldExitRideable: false },
        },
      });
    }
  }, [states.shouldExitRideable]);

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
    const size = modeType === 'vehicle' ? vehicleUrl : airplaneUrl;
    const mySize = characterUrl;
    rideable[objectkey].visible = true;
    rideable[objectkey].position.copy(activeState.position.clone());
    if (refs && refs.rigidBodyRef) {
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
    urls.ridingUrl = props.ridingUrl || urls.characterUrl || null;
    if (props.objectType === 'vehicle') {
      urls.vehicleUrl = props.url;
      urls.wheelUrl = props.wheelUrl || null;
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
    mode.type = props.objectType;
    states.enableRiding = props.enableRiding;
    states.isRiderOn = true;
    states.rideableId = props.objectkey;
    rideable[props.objectkey].visible = false;
    dispatch({
      type: 'update',
      payload: {
        mode: { ...mode },
        states: { ...states },
      },
    });
  };

  const onRideableNear = async (e: CollisionEnterPayload, props: rideableType) => {
    if (e.other.rigidBodyObject.name === 'character' && !states.isRiding) {
      states.nearbyRideable = {
        objectkey: props.objectkey,
        objectType: props.objectType,
        name: props.objectType === 'vehicle' ? '차량' : '비행기',
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
    if (e.other.rigidBodyObject.name === 'character') {
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
    if (states.canRide && states.nearbyRideable && !states.isRiding) {
      const rideableData = rideable[states.nearbyRideable.objectkey];
      if (rideableData) {
        console.log('🔧 탈것 데이터:', rideableData);
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
