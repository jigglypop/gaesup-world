import { quat } from "@react-three/rapier";
import { V3 } from "../../utils/vector";
export default function direction(prop) {
    const { innerGroupRef, worldContext: { activeState, control }, controllerContext: { airplane }, matchSizes, } = prop;
    const { forward, backward, leftward, rightward, shift, space } = control;
    const { angleDelta, maxAngle, accelRatio } = airplane;
    if (!matchSizes || !matchSizes["airplaneUrl"])
        return null;
    let boost = 0;
    boost = space ? Number(shift) : Number(shift) * accelRatio;
    const upDown = Number(backward) - Number(forward);
    const leftRight = Number(rightward) - Number(leftward);
    const front = V3().set(boost, boost, boost);
    activeState.euler.y += -leftRight * angleDelta.y;
    const X = maxAngle.x * upDown;
    const Z = maxAngle.z * leftRight;
    const _x = innerGroupRef.current.rotation.x;
    const _z = innerGroupRef.current.rotation.z;
    const maxX = maxAngle.x;
    const maxZ = maxAngle.z;
    const innerGrounRefRotation = innerGroupRef.current.clone();
    if (_x < -maxX) {
        innerGrounRefRotation.rotation.x = -maxX + X;
    }
    else if (_x > maxX) {
        innerGrounRefRotation.rotation.x = maxX + X;
    }
    else {
        innerGrounRefRotation.rotateX(X);
    }
    if (_z < -maxZ)
        innerGrounRefRotation.rotation.z = -maxZ + Z;
    else if (_z > maxZ)
        innerGrounRefRotation.rotation.z = maxZ + Z;
    else
        innerGrounRefRotation.rotateZ(Z);
    activeState.euler.x = innerGrounRefRotation.rotation.x;
    activeState.euler.z = innerGrounRefRotation.rotation.z;
    innerGrounRefRotation.rotation.y = 0;
    innerGroupRef.current.setRotationFromQuaternion(quat()
        .setFromEuler(innerGroupRef.current.rotation.clone())
        .slerp(quat().setFromEuler(innerGrounRefRotation.rotation.clone()), 0.2));
    activeState.rotation = innerGrounRefRotation.rotation;
    activeState.direction = front.multiply(V3(Math.sin(activeState.euler.y), -upDown, Math.cos(activeState.euler.y)));
    activeState.dir = activeState.direction.normalize();
}
