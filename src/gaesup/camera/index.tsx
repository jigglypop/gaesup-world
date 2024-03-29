import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GaesupControllerContext } from "../controller/context";
import { controllerInnerType, refsType } from "../controller/type";
import { cameraPropType, intersectObjectMapType } from "../physics/type";
import { GaesupWorldContext } from "../world/context";
import normal, { makeNormalCameraPosition } from "./control/normal";
import orbit from "./control/orbit";

export default function Camera({
  refs,
  prop,
  control,
}: {
  refs: refsType;
  prop: controllerInnerType;
  control: {
    [key: string]: boolean;
  };
}) {
  const worldContext = useContext(GaesupWorldContext);
  const controllerContext = useContext(GaesupControllerContext);
  const { mode, cameraOption, activeState } = worldContext;
  const { rigidBodyRef, outerGroupRef } = refs;
  const { camera } = useThree();
  const cameraRef = useRef<CameraControls>();

  const intersectObjectMap: intersectObjectMapType = useMemo(() => ({}), []);
  const cameraProp: cameraPropType = {
    ...prop,
    control,
    controllerContext,
    worldContext,
    intersectObjectMap,
  };

  const position = useMemo(() => camera.position, []);
  const dir = useMemo(() => vec3(), []);
  cameraProp.cameraRay.rayCast = new THREE.Raycaster(
    cameraProp.cameraRay.origin,
    cameraProp.cameraRay.dir,
    0,
    -cameraOption.maxDistance
  );
  useEffect(() => {
    cameraProp.cameraRay.origin.copy(position);
    cameraProp.cameraRay.dir.copy(camera.getWorldDirection(dir));
  }, [cameraProp]);

  useFrame((state, delta) => {
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current
    )
      return;
    cameraProp.delta = delta;
    cameraProp.state = state;
    if (!worldContext.block.camera) {
      if (mode.control === "orbit") {
        orbit(cameraProp);
      } else if (mode.control === "normal") {
        normal(cameraProp);
      }
      // detector(cameraProp);
    }
  });
  // zoom
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.zoomTo(worldContext.cameraOption.zoom, true);
    }
  }, [worldContext.cameraOption.zoom]);

  // 포커스가 아닐 때 카메라 activeStae 따라가기
  useFrame(() => {
    if (!cameraOption.focus) {
      cameraOption.target = activeState.position;
      cameraOption.position = makeNormalCameraPosition(
        activeState,
        cameraOption
      );
    }
  });

  // lookat
  // useEffect(() => {
  //   if (cameraRef.current) {
  //     const currentCamera = camera.position.clone();
  //     if (cameraOption.focus) {
  //       cameraRef.current.setLookAt(
  //         currentCamera.x,
  //         currentCamera.y,
  //         currentCamera.z,
  //         cameraOption.target.x,
  //         cameraOption.target.y,
  //         cameraOption.target.z,
  //         true
  //       );
  //       // 포커스 품
  //     } else if (!cameraOption.focus) {
  //       cameraRef.current.setLookAt(
  //         currentCamera.x,
  //         currentCamera.y,
  //         currentCamera.z,
  //         activeState.position.x,
  //         activeState.position.y,
  //         activeState.position.z,
  //         true
  //       );
  //     }
  //   }
  // }, [cameraOption.focus]);

  return <CameraControls ref={cameraRef}></CameraControls>;
}
