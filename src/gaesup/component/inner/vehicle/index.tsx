import { useEffect } from "react";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { refPropsType } from "../common/type";
import RiderRef from "../rider";
import { VehicleCollider, VehicleWheelCollider } from "./collider";
import { WheelsRef } from "./wheels";

export function VehicleInnerRef({
  children,
  refs,
  urls,
  isRiderOn,
  enableRiding,
  offset,
  name,
  position,
  rotation,
  userData,
  onCollisionEnter,
}: refPropsType) {
  const { vehicleUrl, wheelUrl } = urls;
  const { rigidBodyRef, innerGroupRef, outerGroupRef } = refs;
  const { size: vehicleSize } = useGltfAndSize({
    url: urls.vehicleUrl,
  });

  useEffect(() => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.lockRotations(true, true);
    }
  }, []);

  return (
    <OuterGroupRef ref={outerGroupRef}>
      {vehicleUrl && rigidBodyRef && (
        <RigidBodyRef
          ref={rigidBodyRef}
          name={name}
          position={position}
          rotation={rotation}
          userData={userData}
          onCollisionEnter={onCollisionEnter}
        >
          {wheelUrl ? (
            <VehicleWheelCollider urls={urls} vehicleSize={vehicleSize} />
          ) : (
            <VehicleCollider vehicleSize={vehicleSize} />
          )}
          {enableRiding && isRiderOn && urls.characterUrl && (
            <RiderRef urls={urls} offset={offset} />
          )}
          {children}
          <InnerGroupRef
            type={"vehicle"}
            url={vehicleUrl}
            currentAnimation={"idle"}
            ref={innerGroupRef}
          />
        </RigidBodyRef>
      )}
      {wheelUrl && (
        <WheelsRef refs={refs} urls={urls} vehicleSize={vehicleSize} />
      )}
    </OuterGroupRef>
  );
}
