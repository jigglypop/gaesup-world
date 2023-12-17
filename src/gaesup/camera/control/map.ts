import { cameraPropType } from "../../physics/type";

export default function mapControl(prop: cameraPropType) {
  const {
    state,
    worldContext: { activeState },
  } = prop;
  const position = activeState.position.clone();
  state.camera.position.set(-10, 10, -10).add(position);
}