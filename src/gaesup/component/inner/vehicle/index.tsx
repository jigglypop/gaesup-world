import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { VehicleCollider, VehicleWheelCollider } from "./collider";
import { vehicleInnerType } from "./type";
import { WheelsRef } from "./wheels";

export function VehicleInnerRef(props: vehicleInnerType) {
  const { rigidBodyRef, outerGroupRef } = props;
  const { size: vehicleSize } = useGltfAndSize({
    url: props.url,
  });
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={props.name}
        colliderRef={null}
        componentType={"vehicle"}
        {...props}
      >
        {props.wheelUrl && (
          <VehicleWheelCollider
            wheelUrl={props.wheelUrl}
            vehicleSize={vehicleSize}
          />
        )}
        {props.url && <VehicleCollider vehicleSize={vehicleSize} />}
        {/* {props.enableRiding && props.isRiderOn && (
          <RiderRef urls={props.urls} offset={props.offset} />
        )} */}
        {props.children}
      </RigidBodyRef>
      {props.wheelUrl && (
        <WheelsRef
          rigidBodyRef={rigidBodyRef}
          wheelUrl={props.wheelUrl}
          vehicleSize={vehicleSize}
        />
      )}
    </OuterGroupRef>
  );
}
