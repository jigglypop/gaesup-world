import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  euler,
} from "@react-three/rapier";
import { MutableRefObject, forwardRef, useContext, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions, { subscribeActions } from "../../../animation/actions";
import Camera from "../../../camera";
import { GaesupControllerContext } from "../../../controller/context";
import initCallback from "../../../controller/initialize/callback";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import calculation from "../../../physics";
import { cameraPropType } from "../../../physics/type";
import { V3 } from "../../../utils";
import { GaesupWorldContext } from "../../../world/context";
import { InnerGroupRef } from "./InnerGroupRef";
import { setGroundRay } from "./setGroundRay";
import { rigidBodyRefType } from "./type";

export const RigidBodyRef = forwardRef(
  (props: rigidBodyRefType, ref: MutableRefObject<RapierRigidBody>) => {
    const { size } = useGltfAndSize({ url: props.url });

    props.groundRay &&
      setGroundRay({
        groundRay: props.groundRay,
        length: 0.5,
        colliderRef: props.colliderRef,
      });
    const { scene, animations } = useGLTF(props.url);
    const { actions, ref: animationRef } = useAnimations(animations);
    const worldContext = useContext(GaesupWorldContext);
    const controllerContext = useContext(GaesupControllerContext);
    if (props.isActive) {
      subscribeActions({
        type: props.componentType,
        groundRay: props.groundRay,
        animations: animations,
      });
      const cameraProps: cameraPropType = {
        state: null,
        worldContext,
        controllerContext,
        controllerOptions: props.controllerOptions,
      };
      useFrame((state) => {
        cameraProps.state = state;
      });
      Camera(cameraProps);
      calculation({
        outerGroupRef: props.outerGroupRef,
        innerGroupRef: props.innerGroupRef,
        rigidBodyRef: ref,
        colliderRef: props.colliderRef,
        groundRay: props.groundRay,
      });
    }
    playActions({
      type: props.componentType,
      actions,
      animationRef,
      currentAnimation: props.isActive ? undefined : props.currentAnimation,
      isActive: props.isActive,
    });
    initCallback({
      props,
      actions,
      componentType: props.componentType,
    });
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find(
      (node) => node.type === "Object3D"
    );
    useFrame(() => {
      if (props.isActive || !props.position || !ref || !ref.current) return;
      ref.current.setTranslation(
        V3(
          THREE.MathUtils.lerp(
            ref.current.translation().x,
            props.position.x,
            props.controllerOptions.lerp.cameraPosition
          ),
          THREE.MathUtils.lerp(
            ref.current.translation().y,
            props.position.y,
            props.controllerOptions.lerp.cameraPosition
          ),
          THREE.MathUtils.lerp(
            ref.current.translation().z,
            props.position.z,
            props.controllerOptions.lerp.cameraPosition
          )
        ),
        false
      );
    });
    return (
      <RigidBody
        colliders={false}
        ref={ref}
        name={props.name}
        rotation={euler()
          .set(0, props.rotation?.clone().y || 0, 0)
          .clone()}
        userData={props.userData}
        type={props.rigidbodyType || (props.isActive ? "dynamic" : "fixed")}
        sensor={props.sensor}
        onIntersectionEnter={props.onIntersectionEnter}
        onCollisionEnter={props.onCollisionEnter}
        {...props.rigidBodyProps}
      >
        <CapsuleCollider
          ref={props.colliderRef}
          args={[(size.y / 2 - size.x) * 1.2, size.x * 1.2]}
          position={[0, (size.y / 2 + size.x / 2) * 1.2, 0]}
        />
        {props.children}
        <InnerGroupRef
          objectNode={objectNode}
          animationRef={animationRef}
          nodes={nodes}
          ref={props.innerGroupRef}
          isActive={props.isActive}
          isRiderOn={props.isRiderOn}
          enableRiding={props.enableRiding}
          ridingUrl={props.ridingUrl}
          offset={props.offset}
        >
          {props.children}
        </InnerGroupRef>
      </RigidBody>
    );
  }
);
