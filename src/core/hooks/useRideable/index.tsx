import { useCallback, useEffect } from 'react';

import { CollisionEnterPayload, CollisionExitPayload, euler, vec3 } from '@react-three/rapier';

import { useGaesupGltf } from '@/core/motions/hooks/useGaesupGltf';
import { useGaesupStore } from '@stores/gaesupStore';

import { rideableType } from './types';
import { useStateSystem } from '../../motions/hooks/useStateSystem';

export const rideableDefault: Omit<rideableType, 'objectkey' | 'objectType' | 'url' | 'wheelUrl'> =
  {
    isRiderOn: false,
    position: vec3(),
    rotation: euler(),
    offset: vec3(),
    visible: true,
  };

export function useRideable() {
  const { gameStates, updateGameStates, activeState } = useStateSystem();
  const rideable = useGaesupStore((state) => state.rideable);
  const urls = useGaesupStore((state) => state.urls);
  const setMode = useGaesupStore((state) => state.setMode);
  const setRideable = useGaesupStore((state) => state.setRideable);
  const setUrls = useGaesupStore((state) => state.setUrls);
  const { getSizesByUrls } = useGaesupGltf();

  const toModeType = useCallback(
    (objectType: rideableType['objectType']) =>
      objectType === 'airplane' ? 'airplane' : 'vehicle',
    [],
  );

  const setUrl = useCallback(
    (props: rideableType) => {
      const newUrls: Partial<typeof urls> = {};
      const ridingUrl = props.ridingUrl ?? urls.characterUrl;
      if (typeof ridingUrl === 'string' && ridingUrl.length > 0) {
        newUrls.ridingUrl = ridingUrl;
      }

      if (props.objectType === 'airplane') {
        newUrls.airplaneUrl = props.url ?? '';
        setUrls(newUrls);
        return;
      }

      if (props.objectType) {
        newUrls.vehicleUrl = props.url ?? '';
        newUrls.wheelUrl = props.wheelUrl ?? '';
      }
      setUrls(newUrls);
    },
    [setUrls, urls],
  );

  const landing = useCallback(
    (objectkey: string) => {
      const rideableItem = rideable[objectkey];
      if (!rideableItem?.position) return;

      const modeType = rideableItem.objectType;
      const { vehicleUrl, airplaneUrl, characterUrl } = getSizesByUrls(
        urls as unknown as Record<string, string | undefined>,
      );
      const size = modeType === 'airplane' ? airplaneUrl : vehicleUrl;
      const mySize = characterUrl;
      if (!size || !mySize) return;

      updateGameStates({
        canRide: false,
        isRiding: false,
        currentRideable: undefined,
      });

      setRideable(objectkey, {
        ...rideableItem,
        visible: true,
        position: activeState.position.clone(),
      });
    },
    [
      rideable,
      getSizesByUrls,
      urls,
      updateGameStates,
      setRideable,
      activeState.position,
    ],
  );

  const enterRideable = useCallback(async () => {
    if (gameStates.canRide && gameStates.nearbyRideable && !gameStates.isRiding) {
      const { objectkey, objectType } = gameStates.nearbyRideable;
      const rideableItem = rideable[objectkey];
      if (!rideableItem) return;
      setUrl(rideableItem);
      setMode({ type: toModeType(objectType) });
      updateGameStates({
        currentRideable: gameStates.nearbyRideable,
        isRiding: true,
        canRide: false,
        nearbyRideable: undefined,
      });
      setRideable(objectkey, {
        ...rideableItem,
        visible: false,
      });
    }
  }, [
    gameStates.canRide,
    gameStates.nearbyRideable,
    gameStates.isRiding,
    rideable,
    setUrl,
    setMode,
    toModeType,
    updateGameStates,
    setRideable,
  ]);

  const exitRideable = useCallback(async () => {
    if (gameStates.isRiding && gameStates.currentRideable) {
      landing(gameStates.currentRideable.objectkey);
      setMode({ type: 'character' });
      updateGameStates({
        isRiding: false,
        currentRideable: undefined,
      });
    }
  }, [gameStates.isRiding, gameStates.currentRideable, landing, setMode, updateGameStates]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code !== 'KeyF') return;
      if (gameStates.canRide && gameStates.nearbyRideable) {
        void enterRideable();
      } else if (gameStates.isRiding) {
        void exitRideable();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    gameStates.canRide,
    gameStates.nearbyRideable,
    gameStates.isRiding,
    enterRideable,
    exitRideable,
  ]);

  const initRideable = useCallback(
    (props: rideableType) => {
      setRideable(props.objectkey, {
        ...rideableDefault,
        ...props,
      });
    },
    [setRideable],
  );

  const updateRideable = useCallback(
    (props: rideableType) => {
      setRideable(props.objectkey, props);
    },
    [setRideable],
  );

  const getRideable = (objectkey: string): rideableType | undefined => {
    return rideable[objectkey];
  };

  const onRideableNear = useCallback(
    async (e: CollisionEnterPayload, props: rideableType) => {
      const isCharacterCollision =
        (e.other.rigidBodyObject &&
          e.other.rigidBodyObject.name === 'character') ||
        (e.other.rigidBodyObject && !e.other.rigidBodyObject.name) ||
        e.other.rigidBody;
      if (isCharacterCollision && !gameStates.isRiding) {
        if (!props.objectType) return;
        updateGameStates({
          nearbyRideable: {
            id: props.objectkey,
            objectkey: props.objectkey,
            objectType: props.objectType,
            type: 'rideable',
            maxSpeed: 0,
            acceleration: 0,
            deceleration: 0,
            isOccupied: false,
            controls: {
              forward: false,
              backward: false,
              left: false,
              right: false,
              brake: false,
            },
            name: props.objectType === 'vehicle' ? '차량' : '비행기',
            ...(props.rideMessage ? { rideMessage: props.rideMessage } : {}),
            ...(props.exitMessage ? { exitMessage: props.exitMessage } : {}),
            ...(props.displayName ? { displayName: props.displayName } : {}),
          },
          canRide: true,
        });
      }
    },
    [gameStates.isRiding, updateGameStates],
  );

  const onRideableLeave = useCallback(
    async (e: CollisionExitPayload) => {
      const isCharacterCollision =
        (e.other.rigidBodyObject &&
          e.other.rigidBodyObject.name === 'character') ||
        (e.other.rigidBodyObject && !e.other.rigidBodyObject.name) ||
        e.other.rigidBody;

      if (isCharacterCollision) {
        updateGameStates({
          nearbyRideable: undefined,
          canRide: false,
        });
      }
    },
    [updateGameStates],
  );

  return {
    initRideable,
    updateRideable,
    getRideable,
    onRideableNear,
    onRideableLeave,
    enterRideable,
    exitRideable,
    landing,
  };
}
