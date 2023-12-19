import { useFrame } from "@react-three/fiber";
import { passiveRefsType } from "../component/type";
import { gaesupPassivePropsType } from "../hooks/useGaesupController";
import airplaneMutation from "./airplane";
import characterMutation from "./character";
import { passiveMutationPropType } from "./type";
import vehicleMutation from "./vehicle";

export default function mutation({
  props,
  refs,
  delta,
}: {
  props: gaesupPassivePropsType;
  refs: passiveRefsType;
  delta: number;
}) {
  const { mode } = props;
  useFrame(() => {
    const { state } = props;
    const { rigidBodyRef, outerGroupRef, innerGroupRef } = refs;
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current ||
      !innerGroupRef ||
      !innerGroupRef.current
    )
      return null;

    const mutationProps: passiveMutationPropType = {
      outerGroupRef,
      rigidBodyRef,
      innerGroupRef,
      position: state.position,
      euler: state.euler,
      quat: state.quat,
      rotation: state.rotation,
      delta,
    };
    if (mode.type === "character") characterMutation(mutationProps);
    else if (mode.type === "airplane") airplaneMutation(mutationProps);
    else if (mode.type === "vehicle") vehicleMutation(mutationProps);
  });
}
