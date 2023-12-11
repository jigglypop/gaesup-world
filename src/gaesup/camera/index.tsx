import {
  MapControls,
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext } from "react";
import * as THREE from "three";
import { propType, refsType } from "../controller/type";
import { cameraPropType } from "../physics/type";
import { GaesupControllerContext } from "../stores/context/controller";
import { GaesupWorldContext } from "../stores/context/gaesupworld";
import cameraCollisionDetector from "./cameraCollisionDetecter";
import mapControl from "./control/map";
import normal from "./control/normal";
import orbit from "./control/orbit";

export default function Camera({
  refs,
  prop,
  control,
}: {
  refs: refsType;
  prop: propType;
  control: {
    [key: string]: boolean;
  };
}) {
  const worldContext = useContext(GaesupWorldContext);
  const controllerContext = useContext(GaesupControllerContext);
  const { cameraMode, perspectiveCamera, orthographicCamera } =
    controllerContext;
  const { rigidBodyRef, outerGroupRef } = refs;
  const { cameraRay } = prop;
  const { checkCollision } = cameraCollisionDetector(prop);
  const { scene, camera } = useThree();
  const { activeState } = worldContext;

  const intersectObjectMap: { [uuid: string]: THREE.Object3D } = {};
  const cameraProp: cameraPropType = {
    ...prop,
    checkCollision,
    control,
    controllerContext,
    worldContext,
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

  useFrame((state, delta) => {
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current
    )
      return null;
    cameraProp.state = state;
    cameraProp.delta = delta;

    if (cameraMode.cameraType === "perspective") {
      scene.children.forEach((child) => getMeshs(child));
      cameraRay.intersectObjectMap = intersectObjectMap;
      if (cameraMode.controlType === "orbit") {
        orbit(cameraProp);
      } else if (cameraMode.controlType === "normal") {
        normal(cameraProp);
      }
    } else if (cameraMode.cameraType === "orthographic") {
      mapControl(cameraProp);
    }
  });

  return (
    <>
      {cameraMode.cameraType === "perspective" && (
        <>
          <OrbitControls target={activeState.position} />
          <PerspectiveCamera makeDefault {...perspectiveCamera} />
        </>
      )}
      {cameraMode.cameraType === "orthographic" && (
        <>
          <MapControls target={activeState.position} />
          <OrthographicCamera makeDefault {...orthographicCamera} />
        </>
      )}
    </>
  );
}
