import { CuboidCollider } from "@react-three/rapier";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { airplaneInnerType } from "./type";

export function AirplaneInnerRef(props: airplaneInnerType) {
  const { rigidBodyRef, outerGroupRef } = props;
  const { size } = useGltfAndSize({
    url: props.url,
  });
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={props.name}
        componentType={"airplane"}
        {...props}
      >
        <CuboidCollider
          args={[size.x / 2, size.y / 2, size.z / 2]}
          position={[0, size.y / 2, 0]}
        />
        {props.children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}
