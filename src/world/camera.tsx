import { useFrame } from '@react-three/fiber';
import { useContext, useMemo, useRef, createContext, ReactNode } from 'react';
import * as THREE from 'three';
import { cameraPropType } from '../physics/type';
import { makeNormalCameraPosition } from './camera/normal';
import normalCamera from './camera/normal';
import orbitCamera from './camera/orbit';
import { GaesupWorldContext, GaesupWorldDispatchContext } from './context';
import { controllerInitialState } from '../context/initialStates';
import { gaesupControllerType } from '../controller/context/type';
import { refsType } from '../controller/type';

export const CameraHelperContext = createContext<{
  performRaycast?: (state: any) => THREE.Intersection<THREE.Object3D>[] | undefined;
  updateCamera?: (frameState: any) => void;
}>({});

export default function Camera(props: cameraPropType) {
  const { state } = props;
  const worldContext = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const frameCountRef = useRef(0);
  const raycastIntervalRef = useRef(2);
  const lastRaycastResultRef = useRef<THREE.Intersection<THREE.Object3D>[]>([]);

  const tempRaycaster = useMemo(() => new THREE.Raycaster(), []);
  const tempVector = useMemo(() => new THREE.Vector3(), []);
  const raycastTargets = useRef<THREE.Object3D[]>([]);

  const prevActivePositionRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const prevCameraPositionRef = useRef<THREE.Vector3>(new THREE.Vector3());

  const hasSignificantMovement = (a: THREE.Vector3, b: THREE.Vector3, threshold = 0.01) => {
    return a.distanceToSquared(b) > threshold * threshold;
  };

  const performRaycast = (state) => {
    if (!worldContext.cameraOption || !worldContext.activeState) return;

    frameCountRef.current++;
    if (frameCountRef.current % raycastIntervalRef.current !== 0) {
      return lastRaycastResultRef.current;
    }
    if (raycastTargets.current.length === 0 && state.scene) {
      raycastTargets.current = state.scene.children.filter((obj) => !obj.userData?.intangible);
    }
    const cameraPosition = worldContext.cameraOption.position.clone();
    tempVector.copy(worldContext.activeState.position).sub(cameraPosition).normalize();
    tempRaycaster.set(cameraPosition, tempVector);
    tempRaycaster.far = Math.abs(worldContext.cameraOption.maxDistance || 10);

    const intersects = tempRaycaster.intersectObjects(raycastTargets.current, true);
    lastRaycastResultRef.current = intersects;

    if (intersects.length > 0 && worldContext.cameraOption) {
      handleCameraCollision(intersects, cameraPosition);
    }
    return intersects;
  };

  const handleCameraCollision = (intersects, cameraPosition) => {
    const collision = intersects[0];
    const distanceToCollision = collision.distance;
    const maxDistance = Math.abs(worldContext.cameraOption.maxDistance || 10);

    if (distanceToCollision < maxDistance) {
      const direction = tempVector
        .copy(worldContext.activeState.position)
        .sub(cameraPosition)
        .normalize();

      const newPosition = worldContext.activeState.position
        .clone()
        .sub(direction.multiplyScalar(distanceToCollision * 0.9));

      const currentPos = worldContext.cameraOption.position;
      if (!hasSignificantMovement(currentPos, newPosition, 0.01)) return;
      worldContext.cameraOption.position.copy(newPosition);
      dispatch({
        type: 'update',
        payload: {
          cameraOption: { ...worldContext.cameraOption },
        },
      });
    }
  };

  const updateCamera = (frameState) => {
    if (!state) props.state = frameState;
    if (!worldContext.block.camera) {
      const activeMoved = hasSignificantMovement(
        prevActivePositionRef.current,
        worldContext.activeState.position,
      );
      const cameraMoved = hasSignificantMovement(
        prevCameraPositionRef.current,
        worldContext.cameraOption.position,
      );
      if (worldContext.cameraOption?.maxDistance && (activeMoved || cameraMoved)) {
        performRaycast(frameState);
      }
    }

    if (!worldContext.cameraOption.focus) {
      worldContext.cameraOption.target = worldContext.activeState.position.clone();
      worldContext.cameraOption.position = makeNormalCameraPosition(
        worldContext.activeState,
        worldContext.cameraOption,
      );
    }
    prevActivePositionRef.current.copy(worldContext.activeState.position);
    prevCameraPositionRef.current.copy(worldContext.cameraOption.position);
  };

  const contextValue = useMemo(
    () => ({
      performRaycast,
      updateCamera,
    }),
    [worldContext.cameraOption, worldContext.activeState],
  );

  return (
    <CameraHelperContext.Provider value={contextValue}>
      {props.children}
    </CameraHelperContext.Provider>
  );
}

export function CameraUpdater({
  controllerOptions,
  children,
}: {
  controllerOptions: any;
  children?: ReactNode;
}) {
  const { updateCamera } = useContext(CameraHelperContext);
  const worldContext = useContext(GaesupWorldContext);

  const characterInnerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (updateCamera) {
      updateCamera(state);
    }
    if (!worldContext.block.camera) {
      const completeRefs: refsType = {
        ...(controllerInitialState.refs || {}),
        characterInnerRef,
        colliderRef: controllerInitialState.refs?.colliderRef || useRef(null),
        rigidBodyRef: controllerInitialState.refs?.rigidBodyRef || useRef(null),
        outerGroupRef: controllerInitialState.refs?.outerGroupRef || useRef(null),
        innerGroupRef: controllerInitialState.refs?.innerGroupRef || useRef(null),
      };

      const controllerContext: gaesupControllerType = {
        airplane: controllerInitialState.airplane,
        vehicle: controllerInitialState.vehicle,
        character: controllerInitialState.character,
        controllerOptions: controllerOptions || controllerInitialState.controllerOptions,
        callbacks: controllerInitialState.callbacks,
        refs: completeRefs,
      };

      const cameraProps: cameraPropType = {
        state,
        worldContext,
        controllerContext,
        controllerOptions,
      };

      if (worldContext.mode.control === 'orbit') {
        orbitCamera(cameraProps);
      } else {
        normalCamera(cameraProps);
      }
    }
  });

  return <>{children}</>;
}
