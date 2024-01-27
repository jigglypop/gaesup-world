import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GaesupControllerContext } from "../controller/context";
import { controllerInnerType, refsType } from "../controller/type";
import { cameraPropType, intersectObjectMapType } from "../physics/type";
import { GaesupWorldContext } from "../world/context";
import normal from "./control/normal";
import orbit from "./control/orbit";
import detector from "./detector";

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
  const { mode, cameraOption } = worldContext;
  const { rigidBodyRef, outerGroupRef } = refs;
  const { scene, camera } = useThree();
  const cameraRef = useRef<CameraControls>();

  const intersectObjectMap: intersectObjectMapType = useMemo(() => ({}), []);
  const cameraProp: cameraPropType = {
    ...prop,
    control,
    controllerContext,
    worldContext,
    intersectObjectMap,
  };
  const getMeshs = (object: THREE.Object3D) => {
    if (object.userData && object.userData.intangible) return;
    if (
      object instanceof THREE.Mesh &&
      object.geometry.type !== "InstancedBufferGeometry"
    ) {
      intersectObjectMap[object.uuid] = object;
    }
    object.children.forEach((child) => {
      getMeshs(child);
    });
  };

  useEffect(() => {
    scene.children.forEach((child) => getMeshs(child));
  }, []);

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
      detector(cameraProp);
    }
  });

  //   // moveTo 함수 정의
  //   worldContext.moveTo = async (
  //     position: THREE.Vector3,
  //     target: THREE.Vector3
  //   ) => {
  //     camera.position.copy(position);
  //     if (mode.control === "orbit") {
  //       await Promise.all([
  //         cameraRef.current.setPosition(position.x, position.y, position.z, true),
  //
  //         camera.rotation.copy(worldContext.activeState.euler),
  //         cameraRef.current.setLookAt(
  //           position.x,
  //           position.y,
  //           position.z,
  //           target.x,
  //           target.y,
  //           target.z,
  //           true
  //         ),
  //       ]);
  //     } else if (mode.control === "normal") {
  //       await Promise.all([
  //         cameraRef.current.setPosition(0, position.y, position.z, true),
  //         camera.rotation.copy(worldContext.activeState.euler),
  //         cameraRef.current.setLookAt(
  //           0,
  //           position.y,
  //           position.z,
  //           target.x,
  //           target.y,
  //           target.z,
  //           true
  //         ),
  //       ]);
  //     }
  //   };

  return <CameraControls ref={cameraRef}></CameraControls>;
}
