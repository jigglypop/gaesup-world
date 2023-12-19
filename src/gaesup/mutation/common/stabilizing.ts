import { passiveMutationPropType } from "../type";

export default function stabilizing(props: passiveMutationPropType) {
  const { rigidBodyRef } = props;
  rigidBodyRef.current.setEnabledRotations(false, false, false, false);
}
