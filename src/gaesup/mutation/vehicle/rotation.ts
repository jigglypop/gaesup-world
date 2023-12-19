import { passiveMutationPropType } from "../type";

export default function rotation(props: passiveMutationPropType) {
  const { rigidBodyRef, euler, quat } = props;
  quat.setFromEuler(euler);
  rigidBodyRef.current.setRotation(quat, false);
}
