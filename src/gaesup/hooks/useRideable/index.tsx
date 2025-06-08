import { CollisionEnterPayload, CollisionExitPayload, euler, vec3 } from '@react-three/rapier';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { gameStore } from '../../store/gameStore';
import { gameActions } from '../../store/actions';
import { useGaesupGltf } from '../useGaesupGltf';
import { RideStateChangeData, rideableType } from './types';

export const rideableDefault: Omit<rideableType, 'objectkey' | 'objectType' | 'url' | 'wheelUrl'> =
  {
    isRiderOn: false,
    position: vec3(),
    rotation: euler(),
    offset: vec3(),
    visible: true,
  };

export function useRideable() {
  const gameStates = useSnapshot(gameStore.gameStates);
  const urls = useSnapshot(gameStore.resources.urls);
  const rideable = useSnapshot(gameStore.resources.rideable);
  const mode = useSnapshot(gameStore.ui.mode);
  const { getSizesByUrls } = useGaesupGltf();

  useEffect(() => {
    if (gameStates.shouldEnterRideable) {
      enterRideable();
      gameActions.updateGameStates({ shouldEnterRideable: false });
    }
  }, [gameStates.shouldEnterRideable]);

  useEffect(() => {
    if (gameStates.shouldExitRideable) {
      exitRideable();
      gameActions.updateGameStates({ shouldExitRideable: false });
    }
  }, [gameStates.shouldExitRideable]);

  const initRideable = (props: rideableType) => {
    gameActions.updateRideable(props.objectkey, {
      ...rideableDefault,
      ...props,
    });
  };

  const setRideable = (props: rideableType) => {
    gameActions.updateRideable(props.objectkey, props);
  };

  const getRideable = (objectkey: string): rideableType | undefined => {
    return gameStore.resources.rideable[objectkey];
  };

  const landing = (objectkey: string) => {
    const activeState = gameStore.physics.activeState;
    const refs = gameStore.physics.refs;
    const rideableItem = gameStore.resources.rideable[objectkey];

    if (!rideableItem || !rideableItem.position) return;

    gameActions.updateGameStates({
      enableRiding: false,
      isRiderOn: false,
      rideableId: null,
    });

    const modeType = rideableItem.objectType;
    const { vehicleUrl, airplaneUrl, characterUrl } = getSizesByUrls(urls as any);
    const size = modeType === 'vehicle' ? vehicleUrl : airplaneUrl;
    const mySize = characterUrl;
    if (!size || !mySize) return;

    gameActions.updateRideable(objectkey, { visible: true });
    gameActions.updateRideable(objectkey, { position: activeState.position.clone() });

    if (refs && refs.rigidBodyRef) {
      refs.rigidBodyRef.current.setTranslation(
        activeState.position.clone().add(size.clone().add(mySize.clone()).addScalar(1)),
        false,
      );
    }

    gameActions.updateMode({ type: 'character' });
  };

  const setUrl = async (props: rideableType) => {
    const updateData: any = {
      ridingUrl: props.ridingUrl || (gameStore.resources.urls as any).characterUrl || undefined,
    };

    if (props.objectType === 'vehicle') {
      updateData.vehicleUrl = props.url;
      updateData.wheelUrl = props.wheelUrl || undefined;
    } else if (props.objectType === 'airplane') {
      updateData.airplaneUrl = props.url;
    }

    gameActions.updateUrls(updateData);
  };

  const setModeAndRiding = async (props: rideableType) => {
    if (!props.objectType) return;

    gameActions.updateMode({ type: props.objectType });
    gameActions.updateGameStates({
      enableRiding: props.enableRiding ?? false,
      isRiderOn: true,
      rideableId: props.objectkey as any,
    });

    gameActions.updateRideable(props.objectkey, { visible: false });
  };

  const onRideableNear = async (e: CollisionEnterPayload, props: rideableType) => {
    if (
      e.other.rigidBodyObject &&
      e.other.rigidBodyObject.name === 'character' &&
      !gameStates.isRiding
    ) {
      if (!props.objectType) return;

      gameActions.updateGameStates({
        nearbyRideable: {
          objectkey: props.objectkey,
          objectType: props.objectType,
          name: props.objectType === 'vehicle' ? '차량' : '비행기',
        } as any,
        canRide: true,
      });
    }
  };

  const onRideableLeave = async (e: CollisionExitPayload) => {
    if (e.other.rigidBodyObject && e.other.rigidBodyObject.name === 'character') {
      gameActions.updateGameStates({
        nearbyRideable: null,
        canRide: false,
      });
    }
  };

  const enterRideable = async () => {
    if (gameStates.canRide && gameStates.nearbyRideable && !gameStates.isRiding) {
      const rideableData =
        gameStore.resources.rideable[(gameStates.nearbyRideable as any).objectkey];
      if (rideableData) {
        await setUrl(rideableData);
        await setModeAndRiding(rideableData);

        gameActions.updateGameStates({
          canRide: false,
          nearbyRideable: null,
        });
      }
    }
  };

  const exitRideable = async () => {
    if (gameStates.isRiding && gameStates.rideableId) {
      landing(gameStates.rideableId);
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
