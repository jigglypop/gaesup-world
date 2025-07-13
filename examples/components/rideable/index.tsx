import { V3 } from '@/core/utils';
import { Rideable, RideableUI } from '@/core/world/components/Rideable';
import { S3 } from '../../config/constants';
import { useStateSystem } from '@/core/motions/hooks/useStateSystem';

export function RideableVehicles() {
  return (
    <>
      <Rideable
        objectkey="vehicle_main"
        url={S3 + '/gorani.glb'}
        objectType="vehicle"
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(-70, 1, 30)}
        controllerOptions={{ lerp: { cameraPosition: 0.1, cameraTurn: 0.1 } }}
        displayName="고라니 차량"
        rideMessage="F키를 눌러 고라니에 탑승하세요"
        exitMessage="F키를 눌러 차량에서 내리세요"
      />
      <Rideable
        objectkey="airplane_main"
        url={S3 + '/gaebird.glb'}
        objectType="airplane"
        enableRiding={true}
        offset={V3(0, 1, 0)}
        position={V3(70, 1, 40)}
        controllerOptions={{ lerp: { cameraPosition: 0.1, cameraTurn: 0.1 } }}
        displayName="비행기"
        rideMessage="F키를 눌러 비행기에 탑승하세요"
        exitMessage="F키를 눌러 비행기에서 내리세요"
      />
    </>
  );
}

export function RideableUIRenderer() {
  const { gameStates } = useStateSystem();
  return <RideableUI states={gameStates} />;
}
