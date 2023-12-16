import { calcPropType } from "../type";

export default function damping(prop: calcPropType) {
  const {
    rigidBodyRef,
    controllerContext: {
      character: { linearDamping },
    },
  } = prop;
  rigidBodyRef.current.setLinearDamping(linearDamping);
}
