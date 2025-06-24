import { V3 } from '@/core/utils';
import { RideableObjects, RideableUI } from '../../../src/core/world/components/Rideable';
import { S3 } from '../../config/constants';
import { useGaesupContext } from '@hooks/index';

export function RideableVehicles() {
  return (
    <>
      <RideableObjects
        objects={[
          {
            id: "vehicle_main",
            type: "rideable",
            position: { x: -70, y: 1, z: 30 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            maxSpeed: 30,
            acceleration: 5,
            deceleration: 3,
            isOccupied: false,
            rideMessage: "F키를 눌러 고라니에 탑승하세요",
            exitMessage: "F키를 눌러 차량에서 내리세요",
            controls: {
              forward: false,
              backward: false,
              left: false,
              right: false,
              brake: false
            },
            metadata: { name: "고라니 차량" }
          },
          {
            id: "airplane_main", 
            type: "rideable",
            position: { x: 70, y: 1, z: 40 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            maxSpeed: 50,
            acceleration: 8,
            deceleration: 4,
            isOccupied: false,
            rideMessage: "F키를 눌러 비행기에 탑승하세요",
            exitMessage: "F키를 눌러 비행기에서 내리세요",
            controls: {
              forward: false,
              backward: false,
              left: false,
              right: false,
              brake: false
            },
            metadata: { name: "비행기" }
          },
          {
            id: "airplane_advanced",
            type: "rideable", 
            position: { x: -30, y: 1, z: 80 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            maxSpeed: 80,
            acceleration: 12,
            deceleration: 6,
            isOccupied: false,
            rideMessage: "F키를 눌러 전투기에 탑승하세요",
            exitMessage: "F키를 눌러 전투기에서 내리세요",
            controls: {
              forward: false,
              backward: false,
              left: false,
              right: false,
              brake: false
            },
            metadata: { name: "오리 전투기" }
          }
        ]}
      />
    </>
  );
}

export function RideableUIRenderer() {
  const { states } = useGaesupContext();
  return <RideableUI states={states} />;
}
