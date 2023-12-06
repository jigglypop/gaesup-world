import { colliderAtom } from "@gaesup/stores/collider";
import { optionsAtom } from "@gaesup/stores/options";
import { useKeyboardControls } from "@react-three/drei";
import { useRapier, vec3 } from "@react-three/rapier";
import { useAtom } from "jotai";
import { useCallback, useContext, useEffect, useMemo } from "react";
import * as THREE from "three";
import { GaesupWorldContext } from "../stores/context";
import {
  constantType,
  controllerType,
  groundRayType,
  refsType,
  slopeRayType,
} from "../type";
import initDebug from "./initDebug";

export default function initProps({
  props,
  refs,
}: {
  props: controllerType;
  refs: refsType;
}) {
  const context = useContext(GaesupWorldContext);
  const { rapier, world } = useRapier();
  const [_, getKeys] = useKeyboardControls();
  const keyControl: {
    [key: string]: boolean;
  } = useCallback(() => {
    return getKeys();
  }, [getKeys])();
  const [options] = useAtom(optionsAtom);

  const groundRay: groundRayType = useMemo(() => {
    return {
      origin: vec3(),
      dir: vec3({ x: 0, y: -1, z: 0 }),
      offset: vec3({ x: 0, y: -context.characterCollider.halfHeight, z: 0 }),
      hit: null,
      parent: null,
      rayCast: null,
      length: context.characterCollider.radius + 2,
    };
  }, []);

  groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
  groundRay.hit = world.castRay(
    groundRay.rayCast,
    groundRay.length,
    true,
    undefined,
    undefined,
    refs.capsuleColliderRef.current!,
    undefined
  );
  groundRay.parent = groundRay.hit?.collider.parent();

  const slopeRay: slopeRayType = useMemo(() => {
    return {
      current: vec3(),
      origin: vec3(),
      hit: null,
      rayCast: null,
      dir: vec3({ x: 0, y: -1, z: 0 }),
      offset: vec3({ x: 0, y: 0, z: colliderAtom.init.radius - 0.03 }),
      length: colliderAtom.init.radius + 3,
      angle: 0,
    };
  }, []);
  slopeRay.rayCast = new rapier.Ray(slopeRay.origin, slopeRay.dir);

  let constant: constantType = useMemo(() => {
    return {
      jumpSpeed: 5,
      jumpAccelY: 5,
      turnSpeed: 10,
      rejectSpeed: 4,
      splintSpeed: 3,
      runRate: 2,
      accelRate: 5,
      splintRate: 2,
      brakeRate: 5,
      wheelOffset: 0.1,
      dT: 10,
      reconsil: 0.3,
      rotational: 0.03,
      vertical: 0.02,
      airDamping: 0.2,
      springConstant: 1.2,
      cameraInitDistance: -5,
      cameraMaxDistance: -7,
      cameraMinDistance: -0.7,
      cameraInitDirection: 0,
      cameraCollisionOff: 0.7,
      cameraDistance: -1,
      cameraCamFollow: 11,
    };
  }, []);

  const move = useMemo(() => {
    return {
      impulse: vec3(),
      direction: vec3(),
      accelation: vec3(),
      velocity: vec3(),
      dragForce: vec3(),
      mass: vec3(),
      dragDamping: vec3({
        x: 0.15,
        y: 0.08,
        z: 0.15,
      }),
    };
  }, []);

  const cameraRay = useMemo(() => {
    return {
      origin: vec3(),
      hit: new THREE.Raycaster(),
      rayCast: new THREE.Raycaster(vec3(), vec3(), 0, -7),
      lerpingPoint: vec3(),
      dir: vec3(),
      position: vec3(),
      length: -1,
      followCamera: new THREE.Object3D(),
      pivot: new THREE.Object3D(),
      intersetesAndTransParented: [],
      intersects: [],
      intersectObjects: [],
      intersectObjectMap: {},
    };
  }, []);
  cameraRay.rayCast = new THREE.Raycaster(
    cameraRay.origin,
    cameraRay.dir,
    0,
    -constant.cameraMaxDistance
  );

  useEffect(() => {
    if (props.constant) {
      constant = {
        ...constant,
        ...Object.assign(constant, props.constant),
      };
    }
  }, []);

  return initDebug({
    options,
    slopeRay,
    groundRay,
    move,
    constant,
    cameraRay,
    capsuleColliderRef: refs.capsuleColliderRef,
    rigidBodyRef: refs.rigidBodyRef,
    outerGroupRef: refs.outerGroupRef,
    slopeRayOriginRef: refs.slopeRayOriginRef,
    keyControl,
  });
}
