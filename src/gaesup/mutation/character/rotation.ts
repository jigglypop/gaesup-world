import { passiveMutationPropType } from "../type";

export default function rotation(props: passiveMutationPropType) {
  const { outerGroupRef, euler, quat, delta } = props;
  quat.setFromEuler(euler);
  outerGroupRef.current.quaternion.rotateTowards(quat, delta);
}
