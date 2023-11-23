import { currentAtom } from '@gaesup/stores/current';
import { optionsAtom } from '@gaesup/stores/options';
import { propType } from '@gaesup/type';
import { V3 } from '@gaesup/utils/vector';
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera
} from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { quat, vec3 } from '@react-three/rapier';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import * as THREE from 'three';
import cameraCollisionDetector from './cameraCollisionDetecter';
/**
 * Follow camera initial setups from props
 * Load camera pivot and character move preset
 */
export default function Camera({ prop }: { prop: propType }) {
  const options = useAtomValue(optionsAtom);
  const { rigidBodyRef, outerGroupRef, cameraRay, constant } = prop;
  const current = useAtomValue(currentAtom);
  const { checkCollision } = cameraCollisionDetector(prop);
  const { camera } = useThree();

  useEffect(() => {
    const origin = new THREE.Object3D();
    origin.position.set(0, 0, constant.cameraInitDirection);
    cameraRay.followCamera = origin;
  }, []);
  useFrame((state, delta) => {
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current
    )
      return null;
    if (options.camera.type === 'perspective') {
      if (options.camera.control === 'orbit') {
        const dir = V3(
          Math.sin(current.euler.y),
          0,
          Math.cos(current.euler.y)
        ).normalize();
        let cameraPosition = vec3(rigidBodyRef.current.translation())
          .clone()
          .add(
            dir
              .clone()
              .multiplyScalar(options.perspectiveCamera.XZDistance)
              .multiplyScalar(options.perspectiveCamera.isFront ? -1 : 1)
              .add(V3(0, options.perspectiveCamera.YDistance, 0))
          );

        state.camera.position.lerp(cameraPosition, 0.2);
        state.camera.quaternion.copy(
          current.quat
            .clone()
            .multiply(
              options.perspectiveCamera.isFront
                ? quat().setFromAxisAngle(V3(0, 1, 0), Math.PI)
                : quat()
            )
        );
        state.camera.lookAt(vec3(rigidBodyRef.current.translation()));
      } else if (options.camera.control === 'normal') {
        cameraRay.pivot.position.lerp(
          current.position,
          1 - Math.exp(-constant.cameraCamFollow * delta)
        );
        state.camera.position.set(0, 0, 0);
        state.camera.lookAt(cameraRay.pivot.position);
        /**
         * Camera collision detect
         */
        checkCollision(delta);
      }
    } else if (options.camera.type === 'orthographic') {
      camera.position
        .set(-10, 10, -10)
        .add(vec3(rigidBodyRef.current.translation()));
    }
  });
  return (
    <>
      {options.camera.type === 'perspective' && (
        <>
          <PerspectiveCamera makeDefault {...options.perspectiveCamera} />
        </>
      )}
      {options.camera.type === 'orthographic' && (
        <>
          <OrbitControls
            target={current.position}
            enableZoom={false}
            enablePan={true}
            zoomSpeed={0.3}
          />
          <OrthographicCamera makeDefault {...options.orthographicCamera} />
        </>
      )}
    </>
  );
}
