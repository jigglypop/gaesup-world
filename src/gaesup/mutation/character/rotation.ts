import { passiveMutationPropType } from "../type";

export default function rotation(props: passiveMutationPropType) {
  const { innerGroupRef, euler, quat: quaternion, delta } = props;
  quaternion.setFromEuler(euler);
  innerGroupRef.current.quaternion.rotateTowards(quaternion, delta * 1);
}
