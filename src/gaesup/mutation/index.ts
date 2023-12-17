import { useFrame } from "@react-three/fiber";
import characterMutation from "./character";
import { passiveMutationPropType, passiveMutationType } from "./type";

export default function mutation(props: passiveMutationType) {
  const { mode } = props;
  useFrame(() => {
    const { rigidBodyRef, outerGroupRef, state, delta } = props;
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current
    )
      return null;

    const mutationProps: passiveMutationPropType = {
      outerGroupRef,
      rigidBodyRef,
      position: state.position,
      euler: state.euler,
      quat: state.quat,
      delta,
    };
    characterMutation(mutationProps);
  });
}
