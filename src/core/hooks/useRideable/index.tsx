import { CollisionEnterPayload, CollisionExitPayload, euler, vec3 } from '@react-three/rapier';
import { useCallback, useEffect } from 'react';
import { useGaesupStore } from '@stores/gaesupStore';
import { rideableType } from './types';
import { useGaesupGltf } from '@/core/motions/entities/useGaesupGltf';

export const rideableDefault: Omit<rideableType, 'objectkey' | 'objectType' | 'url' | 'wheelUrl'> =
  {
    isRiderOn: false,
    position: vec3(),
    rotation: euler(),
    offset: vec3(),
    visible: true,
  };

export function useRideable() {
  const states = useGaesupStore((state) => state.states);
  const rideable = useGaesupStore((state) => state.rideable);
  const activeState = useGaesupStore((state) => state.activeState);
  const urls = useGaesupStore((state) => state.urls);
  const setStates = useGaesupStore((state) => state.setStates);
  const setMode = useGaesupStore((state) => state.setMode);
  const setRideable = useGaesupStore((state) => state.setRideable);
  const setUrls = useGaesupStore((state) => state.setUrls);
  const { getSizesByUrls } = useGaesupGltf();

  const setUrl = useCallback(
    (props: rideableType) => {
      const newUrls: Partial<typeof urls> = {};
      newUrls.ridingUrl = props.ridingUrl ?? urls.characterUrl;
      if (props.objectType === 'vehicle') {
        newUrls.vehicleUrl = props.url ?? '';
        newUrls.wheelUrl = props.wheelUrl ?? '';
      } else if (props.objectType === 'airplane') {
        newUrls.airplaneUrl = props.url ?? '';
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
      const { vehicleUrl, airplaneUrl, characterUrl } = getSizesByUrls(urls);
      const size = modeType === 'vehicle' ? vehicleUrl : airplaneUrl;
      const mySize = characterUrl;
      if (!size || !mySize) return;

      setStates({
        enableRiding: false,
        isRiderOn: false,
        rideableId: '',
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
      setStates,
      setRideable,
      activeState.position,
    ],
  );

  const enterRideable = useCallback(async () => {
    if (states.canRide && states.nearbyRideable && !states.isRiding) {
      const { objectkey, objectType } = states.nearbyRideable;
      const rideableItem = rideable[objectkey];
      if (!rideableItem) return;
      setUrl(rideableItem);
      setMode({ type: objectType });
      setStates({
        rideableId: objectkey,
        isRiding: true,
        canRide: false,
        nearbyRideable: null,
        enableRiding: rideableItem.enableRiding,
        isRiderOn: true,
      });
      setRideable(objectkey, {
        ...rideableItem,
        visible: false,
      });
    }
  }, [
    states.canRide,
    states.nearbyRideable,
    states.isRiding,
    rideable,
    setUrl,
    setMode,
    setStates,
    setRideable,
  ]);

  const exitRideable = useCallback(async () => {
    if (states.isRiding && states.rideableId) {
      landing(states.rideableId);
      setMode({ type: 'character' });
      setStates({
        isRiding: false,
        rideableId: '',
      });
    }
  }, [states.isRiding, states.rideableId, landing, setMode, setStates]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code !== 'KeyF') return;
      if (states.canRide && states.nearbyRideable) {
        void enterRideable();
      } else if (states.isRiding) {
        void exitRideable();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    states.canRide,
    states.nearbyRideable,
    states.isRiding,
    enterRideable,
    exitRideable,
  ]);

  useEffect(() => {
    if (states.shouldEnterRideable) {
      void enterRideable();
      setStates({ shouldEnterRideable: false });
    }
  }, [states.shouldEnterRideable, enterRideable, setStates]);

  useEffect(() => {
    if (states.shouldExitRideable) {
      void exitRideable();
      setStates({ shouldExitRideable: false });
    }
  }, [states.shouldExitRideable, exitRideable, setStates]);

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
      if (isCharacterCollision && !states.isRiding) {
        if (!props.objectType) return;
        setStates({
          nearbyRideable: {
            objectkey: props.objectkey,
            objectType: props.objectType,
            name: props.objectType === 'vehicle' ? '차량' : '비행기',
            rideMessage: props.rideMessage,
            exitMessage: props.exitMessage,
            displayName: props.displayName,
          },
          canRide: true,
        });
      }
    },
    [states.isRiding, setStates],
  );

  const onRideableLeave = useCallback(
    async (e: CollisionExitPayload) => {
      const isCharacterCollision =
        (e.other.rigidBodyObject &&
          e.other.rigidBodyObject.name === 'character') ||
        (e.other.rigidBodyObject && !e.other.rigidBodyObject.name) ||
        e.other.rigidBody;

      if (isCharacterCollision) {
        setStates({
          nearbyRideable: null,
          canRide: false,
        });
      }
    },
    [setStates],
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
