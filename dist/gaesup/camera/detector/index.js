import * as THREE from "three";
export default function detector(cameraProp) {
    var cameraRay = cameraProp.cameraRay, intersectObjectMap = cameraProp.intersectObjectMap;
    var intersects = cameraRay.rayCast.intersectObjects(Object.values(intersectObjectMap));
    var intersectId = {};
    intersects.map(function (_a) {
        var object = _a.object;
        if (object instanceof THREE.Mesh) {
            intersectId[object.uuid] = true;
        }
    });
    Object.values(intersectObjectMap).map(function (mesh) {
        if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.Material) {
            var material = mesh.material;
            if (intersectId[mesh.uuid]) {
                material.opacity = 0.2;
                material.transparent = true;
            }
            else {
                material.opacity = 1;
                material.transparent = false;
            }
        }
    });
}
