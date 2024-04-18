import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import {
  CapsuleCollider,
  RapierRigidBody,
  RigidBody,
  euler,
  useRapier,
  vec3,
} from "@react-three/rapier";
import { MutableRefObject, forwardRef, useContext, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions, { subscribeActions } from "../../../animation/actions";
import Camera from "../../../camera";
import { GaesupControllerContext } from "../../../controller/context";
import { groundRayType } from "../../../controller/type";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import calculation from "../../../physics";
import { cameraPropType } from "../../../physics/type";
import { V3 } from "../../../utils";
import { GaesupWorldContext } from "../../../world/context";
import { calcCharacterColliderProps } from "../character";
import { InnerGroupRef } from "./InnerGroupRef";
import { rigidBodyRefType } from "./type";

export const RigidBodyRef = forwardRef(
  (
    {
      children,
      name,
      position,
      rotation,
      userData,
      onCollisionEnter,
      type,
      outerGroupRef,
      innerGroupRef,
      colliderRef,
      url,
      isActive,
      currentAnimation,
      componentType,
    }: rigidBodyRefType,
    ref: MutableRefObject<RapierRigidBody>
  ) => {
    const { size } = useGltfAndSize({ url });
    const collider = calcCharacterColliderProps(size);

    const groundRay: groundRayType = useMemo(() => {
      return {
        origin: vec3(),
        dir: vec3({ x: 0, y: -1, z: 0 }),
        offset: vec3({ x: 0, y: -1, z: 0 }),
        hit: null,
        parent: null,
        rayCast: null,
        length: 0.5,
      };
    }, []);
    const { rapier, world } = useRapier();
    useFrame(() => {
      groundRay.offset = vec3({
        x: 0,
        y: collider?.halfHeight ? -collider.halfHeight : -1,
        z: 0,
      });

      groundRay.length = 5;
      groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
      groundRay.hit = world.castRay(
        groundRay.rayCast,
        groundRay.length,
        true,
        undefined,
        undefined
      );
      groundRay.parent = groundRay.hit?.collider.parent();
    });

    const { scene, animations } = useGLTF(url);
    const { actions, ref: animationRef } = useAnimations(animations);
    const worldContext = useContext(GaesupWorldContext);
    const controllerContext = useContext(GaesupControllerContext);

    if (isActive) {
      subscribeActions({
        type: componentType,
        groundRay: groundRay,
        animations: animations,
      });
      const cameraProps: cameraPropType = {
        state: null,
        worldContext,
        controllerContext,
      };
      useFrame((state) => {
        cameraProps.state = state;
      });
      Camera(cameraProps);
      calculation({
        outerGroupRef,
        innerGroupRef,
        rigidBodyRef: ref,
        colliderRef,
        groundRay,
      });
    }
    playActions({
      type: componentType,
      actions,
      animationRef,
      currentAnimation: isActive ? undefined : currentAnimation,
      isActive,
    });
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes } = useGraph(clone);
    const objectNode = Object.values(nodes).find(
      (node) => node.type === "Object3D"
    );
    useFrame(() => {
      if (isActive || !position) return;
      ref.current.setTranslation(
        V3(
          THREE.MathUtils.lerp(ref.current.translation().x, position.x, 0.1),
          THREE.MathUtils.lerp(ref.current.translation().y, position.y, 0.1),
          THREE.MathUtils.lerp(ref.current.translation().z, position.z, 0.1)
        ),
        false
      );
    });
    return (
      <RigidBody
        colliders={false}
        ref={ref}
        name={name}
        rotation={euler().set(0, rotation?.clone().y || 0, 0)}
        userData={userData}
        onCollisionEnter={onCollisionEnter}
        type={type || "dynamic"}
      >
        <CapsuleCollider
          ref={colliderRef}
          args={[collider.height, collider.radius]}
          position={[0, collider.height + collider.radius, 0]}
        />
        {children}
        <InnerGroupRef
          objectNode={objectNode}
          animationRef={animationRef}
          nodes={nodes}
          ref={innerGroupRef}
        >
          {children}
        </InnerGroupRef>
      </RigidBody>
    );
  }
);
