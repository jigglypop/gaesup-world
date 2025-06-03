import { calcType } from '../type';

export default function damping(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { control },
    controllerContext: { vehicle },
  } = prop;
  const { space } = control;
  const { brakeRatio, linearDamping } = vehicle;
  rigidBodyRef.current.setLinearDamping(space ? brakeRatio : linearDamping);
}
