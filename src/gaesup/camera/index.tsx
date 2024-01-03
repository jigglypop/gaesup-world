import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
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
  const { mode } = worldContext;
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
    if (!worldContext.cameraBlock) {
      if (mode.control === "orbit") {
        orbit(cameraProp);
      } else if (mode.control === "normal") {
        normal(cameraProp);
      }
      cameraProp.cameraRay.origin.copy(camera.position);
      cameraProp.cameraRay.dir.copy(
        camera.getWorldDirection(new THREE.Vector3())
      );
      detector(cameraProp);
    }
  });

  // moveTo 함수 정의
  worldContext.moveTo = async (
    position: THREE.Vector3,
    target: THREE.Vector3
  ) => {
    camera.position.copy(position);
    await Promise.all([
      cameraRef.current.setPosition(position.x, position.y, position.z, true),
      cameraRef.current.setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z,
        true
      ),
    ]);
  };

  return (
    <>
      <CameraControls ref={cameraRef} />
    </>
  );
}
