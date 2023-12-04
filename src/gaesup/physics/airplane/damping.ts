import { calcPropType } from "..";

export default function damping(prop: calcPropType) {
  const { rigidBodyRef, constant, control } = prop;
  const { space } = control;
  const { brakeRate } = constant;
  rigidBodyRef.current.setLinearDamping(space ? brakeRate : 0.5);
}
