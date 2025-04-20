import { Gltf } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  CylinderCollider,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from '@react-three/rapier';
import { RefObject, createRef, useContext, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGltfAndSize } from '../../../hooks/useGaesupGltf';
import { GaesupWorldContext } from '../../../world/context';

const WheelJoint = ({
  body,
  wheel,
  bodyAnchor,
  wheelAnchor,
  rotationAxis,
  onJointCreated,
}: {
  body: RefObject<RapierRigidBody>;
  wheel: RefObject<RapierRigidBody>;
  bodyAnchor: [number, number, number];
  wheelAnchor: [number, number, number];
  rotationAxis: [number, number, number];
  onJointCreated: (jointRef: RefObject<any>) => void;
}) => {
  const joint = useRevoluteJoint(body, wheel, [bodyAnchor, wheelAnchor, rotationAxis]);
  useEffect(() => {
    if (onJointCreated) onJointCreated(joint);
  }, [joint, onJointCreated]);
  return null;
};

export function WheelsRef({
  vehicleSize,
  rigidBodyRef,
  wheelUrl,
}: {
  vehicleSize: THREE.Vector3;
  rigidBodyRef: RefObject<RapierRigidBody>;
  wheelUrl: string;
}) {
  const { size: wheelSize } = useGltfAndSize({
    url: wheelUrl,
  });
  const { activeState } = useContext(GaesupWorldContext);
  const X = (vehicleSize.x - wheelSize.x) / 2;
  const Z = (vehicleSize.z - 2 * wheelSize.z) / 2;
  const wheelPositions: [number, number, number][] = [
    [-X, 0, Z],
    [-X, 0, -Z],
    [X, 0, Z],
    [X, 0, -Z],
  ];
  const wheelRefs = useRef(wheelPositions.map(() => createRef<RapierRigidBody>()));
  const jointRefs = useRef<Array<ReturnType<typeof useRevoluteJoint>>>(
    Array(wheelPositions.length).fill(null),
  );

  // 모든 휠 조인트를 한번에 업데이트 (useFrame 병합)
  useFrame(() => {
    if (!activeState?.position) return;
    const posLen = activeState.position?.length && activeState.position.length();
    if (!Number.isFinite(posLen)) return;
    jointRefs.current.forEach((jointRef) => {
      if (jointRef?.current && typeof jointRef.current.configureMotorPosition === 'function') {
        jointRef.current.configureMotorPosition(posLen, 0.8, 0);
      }
    });
  });

  return (
    <>
      {wheelRefs &&
        wheelPositions.map((wheelPosition, index) => {
          if (
            !wheelRefs ||
            !wheelRefs.current ||
            !wheelRefs.current[index] ||
            !wheelSize.x ||
            !wheelSize.y
          )
            return <></>;
          const wheelRef = wheelRefs.current[index];
          return (
            <RigidBody
              key={index}
              position={wheelPosition}
              colliders={false}
              type="dynamic"
              ref={wheelRef}
              rotation={[0, 0, Math.PI / 2]}
            >
              <CylinderCollider
                rotation={[0, 0, Math.PI / 2]}
                args={[wheelSize.x / 2, wheelSize.y / 2]}
              />
              <Gltf src={wheelUrl} />
            </RigidBody>
          );
        })}
      {wheelRefs &&
        wheelPositions.map((wheelPosition, index) => {
          if (
            !wheelRefs ||
            !wheelRefs.current ||
            !wheelRefs.current[index] ||
            !wheelSize.x ||
            !wheelSize.y
          )
            return <></>;
          const wheelRef = wheelRefs.current[index];
          return (
            <WheelJoint
              key={index}
              body={rigidBodyRef}
              wheel={wheelRef}
              bodyAnchor={wheelPosition}
              wheelAnchor={[0, 0, 0]}
              rotationAxis={[1, 0, 0]}
              onJointCreated={(joint) => {
                jointRefs.current[index] = joint;
              }}
            />
          );
        })}
    </>
  );
}
