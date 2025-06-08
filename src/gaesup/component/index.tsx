import { vec3 } from '@react-three/rapier';
import { ReactElement, useContext, useMemo } from 'react';
import { controllerInnerType, refsType } from '../controller/type';
import { GaesupContext } from '../atoms';
import { AirplaneRef } from './active/airplane';
import { CharacterRef } from './active/character';
import { VehicleRef } from './active/vehicle';

export function GaesupComponent({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}): ReactElement | null {
  const { mode, states, rideable, urls } = useContext(GaesupContext);

  if (!mode || !states || !rideable || !urls) return null;

  const { enableRiding, isRiderOn, rideableId } = states;

  const offset = useMemo(
    () => (rideableId && rideable[rideableId] ? rideable[rideableId].offset : vec3()),
    [rideableId, rideable],
  );

  const commonProps = useMemo(
    () => ({
      controllerOptions: props.controllerOptions,
      enableRiding,
      isRiderOn,
      groundRay: props.groundRay,
      offset,
      ...refs,
      children: props.children,
    }),
    [
      props.controllerOptions,
      enableRiding,
      isRiderOn,
      props.groundRay,
      offset,
      refs,
      props.children,
    ],
  );

  switch (mode.type) {
    case 'character':
      return (
        <CharacterRef props={props} refs={refs} urls={urls}>
          {props.children}
        </CharacterRef>
      );

    case 'vehicle':
      return (
        <VehicleRef
          {...commonProps}
          url={urls.vehicleUrl}
          wheelUrl={urls.wheelUrl}
          ridingUrl={urls.ridingUrl}
        />
      );

    case 'airplane':
      return <AirplaneRef {...commonProps} url={urls.airplaneUrl} ridingUrl={urls.ridingUrl} />;

    default:
      return null;
  }
}
