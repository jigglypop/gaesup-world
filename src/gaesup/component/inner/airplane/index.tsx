import { CuboidCollider } from "@react-three/rapier";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { refPropsType } from "../common/type";
import RiderRef from "../rider";

export function AirplaneInnerRef({
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
  type,
}: refPropsType) {
  const { airplaneUrl } = urls;
  const { rigidBodyRef, innerGroupRef, outerGroupRef } = refs;
  const { size } = useGltfAndSize({
    url: airplaneUrl,
  });
  return (
    <OuterGroupRef ref={outerGroupRef}>
      {airplaneUrl && (
        <RigidBodyRef
          ref={rigidBodyRef}
          name={name}
          position={position}
          rotation={rotation}
          userData={userData}
          onCollisionEnter={onCollisionEnter}
          type={type}
        >
          <CuboidCollider
            args={[size.x / 2, size.y / 2, size.z / 2]}
            position={[0, size.y / 2, 0]}
          />
          {children}
          <InnerGroupRef
            type={"airplane"}
            url={airplaneUrl}
            currentAnimation={"idle"}
            ref={innerGroupRef}
          >
            {enableRiding && isRiderOn && urls.characterUrl && (
              <RiderRef urls={urls} offset={offset} />
            )}
          </InnerGroupRef>
        </RigidBodyRef>
      )}
    </OuterGroupRef>
  );
}
