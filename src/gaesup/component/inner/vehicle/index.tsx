import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import RiderRef from "../rider";
import { VehicleCollider, VehicleWheelCollider } from "./collider";
import { vehicleInnerType } from "./type";
import { WheelsRef } from "./wheels";

export function VehicleInnerRef(props: vehicleInnerType) {
  const { vehicleUrl, wheelUrl } = props.urls;
  const { rigidBodyRef, innerGroupRef, outerGroupRef, colliderRef } =
    props.refs;
  const { size: vehicleSize } = useGltfAndSize({
    url: props.urls.vehicleUrl,
  });
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={props.name}
        url={vehicleUrl}
        outerGroupRef={outerGroupRef}
        innerGroupRef={innerGroupRef}
        rigidBodyRef={rigidBodyRef}
        colliderRef={null}
        componentType={"vehicle"}
        controllerOptions={props.controllerOptions}
        {...props}
      >
        {wheelUrl && (
          <VehicleWheelCollider urls={props.urls} vehicleSize={vehicleSize} />
        )}
        {vehicleUrl && <VehicleCollider vehicleSize={vehicleSize} />}
        {props.enableRiding && props.isRiderOn && (
          <RiderRef urls={props.urls} offset={props.offset} />
        )}
        {props.children}
      </RigidBodyRef>
      {wheelUrl && (
        <WheelsRef
          refs={props.refs}
          urls={props.urls}
          vehicleSize={vehicleSize}
        />
      )}
    </OuterGroupRef>
  );
}
