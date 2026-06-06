import { useEffect } from 'react';

import { useRideable } from '@hooks/useRideable';
import { useGaesupStore } from '@stores/gaesupStore';

import { RideableUIProps, RideablePropType } from './types';
import { PassiveAirplane } from '../PassiveObjects/Airplane';
import { PassiveVehicle } from '../PassiveObjects/Vehicle';
import './styles.css';

export type {
  GameStates,
  GameStatesType,
  NearbyRideable,
  RideableControls,
  RideableEvents,
  RideablePropType,
  RideableState,
  RideableUIProps,
} from './types';

export function RideableUI(props: RideableUIProps) {
  const { states } = props;
  if (!states) {
    return null;
  }

  if (!states.canRide && !states.isRiding) {
    return null;
  }

  return <RideablePrompt {...props} />;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(' ');
}

function RideablePrompt({
  states,
  actionKey = 'F',
  unstyled = false,
  className,
  classNames,
  styles,
  labels,
}: RideableUIProps) {
  const activeRideable = states.nearbyRideable ?? states.currentRideable;
  if (!activeRideable) return null;

  const rideMessage =
    labels?.ride?.(activeRideable) ??
    activeRideable.rideMessage ??
    `Press ${actionKey} to ride ${
      activeRideable.displayName ??
      activeRideable.name ??
      'vehicle'
    }`;
  const exitMessage =
    labels?.exit?.(activeRideable) ??
    activeRideable.exitMessage ??
    `Press ${actionKey} to exit`;
  const message = states.isRiding ? exitMessage : rideMessage;
  const rootClass = cx(
    !unstyled && 'rideable-ui-container',
    classNames?.root,
    className,
  );
  const boxClass = cx(!unstyled && 'rideable-message-box', classNames?.box);
  const messageClass = cx(!unstyled && 'rideable-message', classNames?.message);
  const keyClass = cx(!unstyled && 'rideable-key', classNames?.key);
  const statsClass = cx(!unstyled && 'rideable-stats', classNames?.stats);
  const statClass = cx(!unstyled && 'rideable-stat', classNames?.stat);
  const statLabelClass = cx(!unstyled && 'rideable-stat__label', classNames?.statLabel);
  const statValueClass = cx(!unstyled && 'rideable-stat__value', classNames?.statValue);

  return (
    <div className={rootClass || undefined} style={styles?.root}>
      <div className={boxClass || undefined} style={styles?.box}>
        <kbd className={keyClass || undefined} style={styles?.key}>{actionKey}</kbd>
        <div className={messageClass || undefined} style={styles?.message}>{message}</div>
        <div className={statsClass || undefined} style={styles?.stats}>
          <div className={statClass || undefined} style={styles?.stat}>
            <span className={statLabelClass || undefined} style={styles?.statLabel}>
              {labels?.speed ?? 'Speed'}
            </span>
            <span className={statValueClass || undefined} style={styles?.statValue}>
              {activeRideable.maxSpeed}
            </span>
          </div>
          <div className={statClass || undefined} style={styles?.stat}>
            <span className={statLabelClass || undefined} style={styles?.statLabel}>
              {labels?.acceleration ?? 'Accel'}
            </span>
            <span className={statValueClass || undefined} style={styles?.statValue}>
              {activeRideable.acceleration}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Rideable(props: RideablePropType) {
  const rideable = useGaesupStore((state) => state.rideable);
  const { initRideable, onRideableNear, onRideableLeave, landing } =
    useRideable();

  useEffect(() => {
    initRideable(props);
  }, [props, initRideable]);

  const { controllerOptions: rawControllerOptions, ...passiveProps } = props;
  const controllerOptions =
    rawControllerOptions?.lerp
      ? {
          lerp: {
            cameraTurn: rawControllerOptions.lerp.cameraTurn ?? 1,
            cameraPosition: rawControllerOptions.lerp.cameraPosition ?? 1,
          },
        }
      : undefined;

  const userData = {
    objectType: props.objectType,
    objectkey: props.objectkey,
    rideable: true,
    init: initRideable,
    onNear: onRideableNear,
    onLeave: onRideableLeave,
    landing,
    rideMessage: props.rideMessage,
    exitMessage: props.exitMessage,
    displayName: props.displayName,
  };

  return (
    <>
      {props.objectType === 'vehicle' && (
        <PassiveVehicle
          {...passiveProps}
          {...(controllerOptions ? { controllerOptions } : {})}
          userData={userData}
          sensor={true}
          visible={rideable[props.objectkey]?.visible !== false && !rideable[props.objectkey]?.isOccupied}
        />
      )}
      {props.objectType === 'airplane' && (
        <PassiveAirplane
          {...passiveProps}
          {...(controllerOptions ? { controllerOptions } : {})}
          userData={userData}
          sensor={true}
          visible={rideable[props.objectkey]?.visible !== false && !rideable[props.objectkey]?.isOccupied}
        />
      )}
    </>
  );
}
