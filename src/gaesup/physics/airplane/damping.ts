import { calcType } from '../type';

export default function damping(prop: calcType) {
  const {
    rigidBodyRef,
    controllerContext: { airplane },
  } = prop;
  const { linearDamping } = airplane;
  rigidBodyRef.current.setLinearDamping(linearDamping);
}
