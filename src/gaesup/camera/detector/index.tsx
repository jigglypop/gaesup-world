import * as THREE from "three";
import { cameraPropType } from "../../physics/type";
export default function detector(cameraProp: cameraPropType) {
  const { cameraRay, intersectObjectMap } = cameraProp;

  const intersects = cameraRay.rayCast.intersectObjects(
    Object.values(intersectObjectMap)
  );

  const intersectId = {};

  intersects.map(({ object }) => {
    if (object instanceof THREE.Mesh) {
      intersectId[object.uuid] = true;
    }
  });

  Object.values(intersectObjectMap).map((mesh) => {
    if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.Material) {
      const material = mesh.material;
      if (intersectId[mesh.uuid]) {
        material.opacity = 0.2;
        material.transparent = true;
      } else {
        material.opacity = 1;
        material.transparent = false;
      }
    }
  });
}
