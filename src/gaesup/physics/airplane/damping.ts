import { calcPropType } from "../type";

export default function damping(prop: calcPropType) {
  const {
    rigidBodyRef,
    controllerContext: { airplane },
  } = prop;
  const { linearDamping } = airplane;
  rigidBodyRef.current.setLinearDamping(linearDamping);
}
