import { passiveMutationPropType } from "../type";

export default function transition(props: passiveMutationPropType) {
  const { rigidBodyRef, position } = props;
  rigidBodyRef.current.setTranslation(position, false);
}
