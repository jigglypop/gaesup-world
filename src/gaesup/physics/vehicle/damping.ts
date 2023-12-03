import { calcPropType } from "..";

export default function damping(prop: calcPropType) {
  const { rigidBodyRef, constant, control } = prop;
  const { brake } = control;
  const { brakeRate } = constant;
  rigidBodyRef.current.setLinearDamping(brake ? brakeRate : 0.5);
}
