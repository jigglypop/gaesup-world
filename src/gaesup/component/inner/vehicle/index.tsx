import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import RiderRef from "../rider";
import { VehicleCollider, VehicleWheelCollider } from "./collider";
import { vehicleInnerType } from "./type";
import { WheelsRef } from "./wheels";

export function VehicleInnerRef(props: vehicleInnerType) {
  const { vehicleUrl, wheelUrl } = props.urls;
  const { rigidBodyRef, innerGroupRef, outerGroupRef, colliderRef } = refs;
  const { size: vehicleSize } = useGltfAndSize({
    url: props.urls.vehicleUrl,
  });

  return (
    <OuterGroupRef ref={outerGroupRef}>
      {vehicleUrl && (
        <RigidBodyRef
          ref={rigidBodyRef}
          name={props.name}
          url={props.urls.vehicleUrl}
          // position={position}
          // rotation={rotation}
          // userData={userData}
          // onCollisionEnter={onCollisionEnter}
          // type={type}
          // url={urls.vehicleUrl}
          outerGroupRef={outerGroupRef}
          innerGroupRef={innerGroupRef}
          rigidBodyRef={rigidBodyRef}
          colliderRef={colliderRef}
          componentType="vehicle"
          {...props}
        >
          {wheelUrl ? (
            <VehicleWheelCollider urls={props.urls} vehicleSize={vehicleSize} />
          ) : (
            <VehicleCollider vehicleSize={vehicleSize} />
          )}
          {props.enableRiding && props.isRiderOn && props.urls.characterUrl && (
            <RiderRef urls={props.urls} offset={props.offset} />
          )}
          {props.children}
        </RigidBodyRef>
      )}
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
