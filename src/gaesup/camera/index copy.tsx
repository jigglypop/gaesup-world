import { useFrame, useThree } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { GaesupControllerContext } from "../controller/context";
import { controllerInnerType, refsType } from "../controller/type";
import { cameraPropType, intersectObjectMapType } from "../physics/type";
import { GaesupWorldContext } from "../world/context";
import normal from "./control/normal";
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
  const { cameraMode } = controllerContext;
  const { rigidBodyRef, outerGroupRef } = refs;
  const { scene, camera } = useThree();

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

  useEffect(() => {
    setTimeout(() => {
      console.log("hi");
      camera.position.lerp(vec3().set(10, 10, 10), 0.2);
    }, 3000);
  }, []);

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

    if (cameraMode.controlType === "orbit") {
      orbit(cameraProp);
    } else if (cameraMode.controlType === "normal") {
      normal(cameraProp);
    }
    // const distV3 = camera.position.clone().sub(activeState.position);
    // cameraRay.origin.copy(camera.position);
    // cameraRay.dir.copy(distV3.negate().normalize());
    // detector(cameraProp);
  });

  return <></>;
}
