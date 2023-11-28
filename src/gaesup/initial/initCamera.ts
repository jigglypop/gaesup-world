import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { propType } from "../type";

export default function initCamera({ prop }: { prop: propType }) {
  // const cameraRay = useMemo(() => {
  //   return {
  //     origin: vec3(),
  //     hit: new THREE.Raycaster(),
  //     rayCast: new THREE.Raycaster(vec3(), vec3(), 0, -7),
  //     lerpingPoint: vec3(),
  //     dir: vec3(),
  //     position: vec3(),
  //     length: -1,
  //     followCamera: new THREE.Object3D(),
  //     pivot: new THREE.Object3D(),
  //     intersetesAndTransParented: [],
  //     intersects: [],
  //     intersectObjects: [],
  //     intersectObjectMap: {},
  //   };
  // }, []);
  // cameraRay.rayCast = new THREE.Raycaster(
  //   cameraRay.origin,
  //   cameraRay.dir,
  //   0,
  //   -prop.constant.cameraMaxDistance
  // );
  const { scene, camera } = useThree();
  const intersectObjectMap: { [uuid: string]: THREE.Object3D } = {};
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
    cameraRay.intersectObjectMap = intersectObjectMap;
    cameraRay.followCamera.add(camera);
    cameraRay.pivot.add(cameraRay.followCamera);
  });
}
