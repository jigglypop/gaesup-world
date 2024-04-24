import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { characterInnerType } from "./type";

export function CharacterInnerRef(props: characterInnerType) {
  const { outerGroupRef } = props;
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        name={"character"}
        url={props.url}
        controllerOptions={props.controllerOptions}
        ref={props.rigidBodyRef}
        groundRay={props.groundRay}
        {...props}
      >
        {props.children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}
