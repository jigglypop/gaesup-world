import { V3 } from '@/core/utils';
import { Rideable, RideableUI } from '../../../src/core/component/rideable';
import { S3 } from '../../config/constants';
import { useGaesupContext } from '@/core/stores/gaesupStore';

export function RideableVehicles() {
  return (
    <>
      <Rideable
        objectkey="vehicle_main"
        url={S3 + '/gorani.glb'}
        objectType="vehicle"
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(-70, 2, 30)}
        controllerOptions={{ lerp: { cameraPosition: 0.1, cameraTurn: 0.1 } }}
      />
      <Rideable
        objectkey="airplane_main"
        url={S3 + '/gaebird.glb'}
        objectType="airplane"
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(70, 2, 40)}
        controllerOptions={{ lerp: { cameraPosition: 0.1, cameraTurn: 0.1 } }}
      />
      <Rideable
        objectkey="airplane_advanced"
        url={S3 + '/orri.glb'}
        objectType="airplane"
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(-30, 2, 80)}
        controllerOptions={{ lerp: { cameraPosition: 0.1, cameraTurn: 0.1 } }}
      />
    </>
  );
}

export function RideableUIRenderer() {
  const { states } = useGaesupContext();
  return <RideableUI states={states} />;
}
