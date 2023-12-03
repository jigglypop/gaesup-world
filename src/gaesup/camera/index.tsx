import orbit from "@camera/control/orbit";
import { currentAtom } from "@gaesup/stores/current";
import { optionsAtom } from "@gaesup/stores/options";
import { propType } from "@gaesup/type";
import {
  OrbitControls,
  OrthographicCamera,
  PerspectiveCamera,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useAtom } from "jotai";
import * as THREE from "three";
import { cameraPropType } from "../physics";
import useCalcControl from "../stores/control";
import cameraCollisionDetector from "./cameraCollisionDetecter";
import normal from "./control/normal";

export default function Camera({ prop }: { prop: propType }) {
  const option = useAtom(optionsAtom);
  const [options] = option;
  const { rigidBodyRef, outerGroupRef, cameraRay, constant } = prop;
  const currents = useAtom(currentAtom);
  const { checkCollision } = cameraCollisionDetector(prop);

  const { scene, camera } = useThree();
  const intersectObjectMap: { [uuid: string]: THREE.Object3D } = {};
  const control = useCalcControl(prop);
  const cameraProp: cameraPropType = {
    ...prop,
    current: currents,
    checkCollision,
    control,
    option,
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

  // useEffect(() => {
  //   if (
  //     options.camera.type === "perspective" &&
  //     options.camera.control === "normal"
  //   ) {
  //     scene.children.forEach((child) => getMeshs(child));
  //     cameraRay.intersectObjectMap = intersectObjectMap;
  //     cameraRay.followCamera.add(camera);
  //     cameraRay.pivot.add(cameraRay.followCamera);
  //   }
  // });

  // useEffect(() => {
  //   refCheck(prop);
  //   cameraSetting(cameraProp);
  // }, []);

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
    if (
      options.camera.type === "perspective" &&
      options.camera.control === "normal"
    ) {
      scene.children.forEach((child) => getMeshs(child));
      cameraRay.intersectObjectMap = intersectObjectMap;
      cameraRay.followCamera.add(camera);
      cameraRay.pivot.add(cameraRay.followCamera);
    }
    if (options.camera.type === "perspective") {
      if (options.camera.control === "orbit") {
        orbit(cameraProp);
      } else if (options.camera.control === "normal") {
        normal(cameraProp);
      }
    } else if (options.camera.type === "orthographic") {
      camera.position
        .set(-10, 10, -10)
        .add(vec3(rigidBodyRef.current.translation()));
    }
  });
  return (
    <>
      {options.camera.type === "perspective" && (
        <>
          <OrbitControls />
          <PerspectiveCamera makeDefault {...options.perspectiveCamera} />
        </>
      )}
      {options.camera.type === "orthographic" && (
        <>
          <OrbitControls
            target={currents[0].position}
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
