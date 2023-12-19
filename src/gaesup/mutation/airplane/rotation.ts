import { quat } from "@react-three/rapier";
import { passiveMutationPropType } from "../type";

export default function rotation(props: passiveMutationPropType) {
  const {
    rigidBodyRef,
    euler,
    quat: quaternion,
    rotation,
    innerGroupRef,
  } = props;
  quaternion.setFromEuler(euler);
  rigidBodyRef.current.setRotation(quaternion, true);
  innerGroupRef.current.setRotationFromQuaternion(
    quat()
      .setFromEuler(innerGroupRef.current.rotation.clone())
      .slerp(quat().setFromEuler(rotation), 0.1)
  );
}
