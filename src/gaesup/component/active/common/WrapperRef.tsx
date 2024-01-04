import { ReactNode, Ref } from "react";
import * as THREE from "three";
import { controllerInnerType, refsType } from "../../../controller/type";
import { GLTFResult } from "../../type";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { SlopeRayRef } from "../common/slopeRayRef";
import { RigidBodyRef } from "./RigidbodyRef";

export function WrapperRef({
  children,
  outerChildren,
  props,
  refs,
  gltf,
  animationRef,
  name,
}: {
  children: ReactNode;
  outerChildren?: ReactNode;
  props: controllerInnerType;
  refs: refsType;
  gltf: GLTFResult;
  animationRef?: Ref<THREE.Object3D<THREE.Object3DEventMap>>;
  name?: string;
}) {
  return (
    <OuterGroupRef ref={refs.outerGroupRef} props={props}>
      <RigidBodyRef ref={refs.rigidBodyRef} name={name}>
        <SlopeRayRef
          slopeRay={props.slopeRay}
          groundRay={props.groundRay}
          ref={refs.slopeRayOriginRef}
        />
        {children}
        {props.children}
        <InnerGroupRef
          props={props}
          gltf={gltf}
          ref={refs.innerGroupRef}
          animationRef={animationRef}
        />
      </RigidBodyRef>
      {outerChildren}
    </OuterGroupRef>
  );
}
