import { vec3 } from '@react-three/rapier';
import { useContext, useMemo } from 'react';
import { controllerInnerType, refsType } from '../controller/type';
import { GaesupWorldContext } from '../world/context';
import { AirplaneRef } from './active/airplane';
import { CharacterRef } from './active/character';
import { VehicleRef } from './active/vehicle';

// 팩토리 객체 - 모드 타입에 따라 적절한 컴포넌트를 반환
const ComponentFactory = {
  character: (props: controllerInnerType, refs: refsType, urls: any) => (
    <CharacterRef props={props} refs={refs} urls={urls}>
      {props.children}
    </CharacterRef>
  ),

  vehicle: (
    props: controllerInnerType,
    refs: refsType,
    urls: any,
    states: any,
    rideable: any,
    rideableId: string | undefined,
  ) => (
    <VehicleRef
      controllerOptions={props.controllerOptions}
      url={urls.vehicleUrl}
      wheelUrl={urls.wheelUrl}
      ridingUrl={urls.ridingUrl}
      enableRiding={states.enableRiding}
      isRiderOn={states.isRiderOn}
      groundRay={props.groundRay}
      offset={rideableId && rideable[rideableId] ? rideable[rideableId].offset : vec3()}
      {...refs}
    >
      {props.children}
    </VehicleRef>
  ),

  airplane: (
    props: controllerInnerType,
    refs: refsType,
    urls: any,
    states: any,
    rideable: any,
    rideableId: string | undefined,
  ) => (
    <AirplaneRef
      controllerOptions={props.controllerOptions}
      url={urls.airplaneUrl}
      ridingUrl={urls.ridingUrl}
      enableRiding={states.enableRiding}
      isRiderOn={states.isRiderOn}
      groundRay={props.groundRay}
      offset={rideableId && rideable[rideableId] ? rideable[rideableId].offset : vec3()}
      {...refs}
    >
      {props.children}
    </AirplaneRef>
  ),
};

export function GaesupComponent({ props, refs }: { props: controllerInnerType; refs: refsType }) {
  const { mode, states, rideable, urls } = useContext(GaesupWorldContext);
  const { rideableId } = states;

  // 렌더링할 컴포넌트 결정
  const Component = useMemo(() => {
    const componentType = mode.type || 'character';

    if (componentType === 'vehicle') {
      return ComponentFactory.vehicle(props, refs, urls, states, rideable, rideableId);
    } else if (componentType === 'airplane') {
      return ComponentFactory.airplane(props, refs, urls, states, rideable, rideableId);
    }

    // 기본값은 character
    return ComponentFactory.character(props, refs, urls);
  }, [mode.type, props, refs, urls, states, rideable, rideableId]);

  return Component;
}
