import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { vehicleInnerType } from "./type";

export function VehicleInnerRef(props: vehicleInnerType) {
  const { rigidBodyRef, outerGroupRef } = props;
  const { size } = useGltfAndSize({
    url: props.url,
  });
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={props.name}
        componentType={"vehicle"}
        {...props}
      >
        {/* <CuboidCollider
          args={[size.x / 2, size.y / 2, size.z / 2]}
          position={[0, size.y / 2, 0]}
        /> */}
        {/* {!props.wheelUrl === undefined && (
          <VehicleWheelCollider
            wheelUrl={props.wheelUrl}
            vehicleSize={vehicleSize}
          />
        )}
        {!props.url === undefined && (
          <VehicleCollider vehicleSize={vehicleSize} />
        )} */}

        {props.children}
      </RigidBodyRef>
      {/* {!props.wheelUrl === undefined && (
        <WheelsRef
          rigidBodyRef={rigidBodyRef}
          wheelUrl={props.wheelUrl}
          vehicleSize={vehicleSize}
        />
      )} */}
    </OuterGroupRef>
  );
}
