export default function cameraCollisionDetector(prop) {
    //   const { cameraRay, constant, options } = prop;
    //   const { camera } = useThree();
    var checkCollision = function (delta) {
        //     cameraRay.origin.copy(cameraRay.pivot.position);
        //     camera.getWorldPosition(cameraRay.position);
        //     cameraRay.dir.subVectors(cameraRay.position, cameraRay.pivot.position);
        //     cameraRay.intersects = cameraRay.rayCast!.intersectObjects(
        //       Object.values(cameraRay.intersectObjectMap)
        //     );
        //     if (
        //       cameraRay.intersects.length &&
        //       cameraRay.intersects[0].distance <= -constant.cameraInitDistance
        //     ) {
        //       if (options.cameraCollisionType === "transparent") {
        //         cameraRay.intersetesAndTransParented = [...cameraRay.intersects];
        //         cameraRay.intersetesAndTransParented.map((intersect) => {
        //           const mesh = intersect.object as THREE.Mesh;
        //           const material = mesh.material as THREE.MeshStandardMaterial;
        //           material.opacity = 0.2;
        //           material.transparent = true;
        //         });
        //       } else if (options.cameraCollisionType === "closeUp") {
        //         constant.cameraMinDistance =
        //           -cameraRay.intersects[0].distance * constant.cameraCollisionOff < -0.7
        //             ? -cameraRay.intersects[0].distance * constant.cameraCollisionOff
        //             : -0.7;
        //       }
        //     } else {
        //       if (options.cameraCollisionType === "transparent") {
        //         cameraRay.intersetesAndTransParented.map((intersect) => {
        //           const mesh = intersect.object as THREE.Mesh;
        //           const material = mesh.material as THREE.MeshStandardMaterial;
        //           material.opacity = 1;
        //           material.transparent = false;
        //         });
        //         cameraRay.intersetesAndTransParented = [];
        //       }
        //       constant.cameraMinDistance = constant.cameraInitDistance;
        //     }
        //     cameraRay.lerpingPoint.set(
        //       cameraRay.followCamera.position.x,
        //       constant.cameraMinDistance * Math.sin(-cameraRay.followCamera.rotation.x),
        //       constant.cameraMinDistance * Math.cos(-cameraRay.followCamera.rotation.x)
        //     );
        //
        //     cameraRay.followCamera.position.lerp(cameraRay.lerpingPoint, delta * 4);
    };
    return { checkCollision: checkCollision };
}