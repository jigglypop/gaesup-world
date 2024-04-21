import { CuboidCollider } from "@react-three/rapier";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { vehicleInnerType } from "../vehicle/type";

export function AirplaneInnerRef(props: vehicleInnerType) {
  const { airplaneUrl } = props.urls;
  const { rigidBodyRef, innerGroupRef, outerGroupRef, colliderRef } =
    props.refs;
  const { size } = useGltfAndSize({
    url: airplaneUrl,
  });
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={props.name}
        url={props.urls.airplaneUrl}
        outerGroupRef={outerGroupRef}
        innerGroupRef={innerGroupRef}
        rigidBodyRef={rigidBodyRef}
        colliderRef={colliderRef}
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
