import { Collider } from '@dimforge/rapier3d-compat';
import { CuboidCollider } from '@react-three/rapier';
import { Ref, forwardRef } from 'react';
import { useGltfAndSize } from '../../../gltf';
import { VehicleColliderProps, VehicleWheelColliderProps } from './type';

export const VehicleWheelCollider = forwardRef(
  ({ wheelUrl, vehicleSize }: VehicleWheelColliderProps, ref: Ref<Collider>) => {
    const { size: wheelSize } = useGltfAndSize({
      url: wheelUrl,
    });
    return (
      <CuboidCollider
        ref={ref as any}
        args={[vehicleSize.x / 2, vehicleSize.y / 2 - wheelSize.y / 2, vehicleSize.z / 2]}
        position={[0, vehicleSize.y / 2 + wheelSize.y / 2, 0]}
      />
    );
  },
);

export const VehicleCollider = forwardRef(
  ({ vehicleSize }: VehicleColliderProps, ref: Ref<Collider>) => {
    return (
      <CuboidCollider
        ref={ref as any}
        args={[vehicleSize.x / 2, vehicleSize.y / 2, vehicleSize.z / 2]}
        position={[0, vehicleSize.y / 2, 0]}
      />
    );
  },
);
