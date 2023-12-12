import { calcPropType } from "../type";

export default function damping(prop: calcPropType) {
  const {
    rigidBodyRef,
    constant,
    worldContext: { control },
  } = prop;
  const { space } = control;
  const { brakeRate } = constant;
  rigidBodyRef.current.setLinearDamping(space ? brakeRate : 0.5);
}