import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, euler, useRapier, vec3, } from "@react-three/rapier";
import { forwardRef, useContext, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions, { subscribeActions } from "../../../animation/actions";
import Camera from "../../../camera";
import { GaesupControllerContext } from "../../../controller/context";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import calculation from "../../../physics";
import { V3 } from "../../../utils";
import { GaesupWorldContext } from "../../../world/context";
import { calcCharacterColliderProps } from "../../inner/common/calc";
import { InnerGroupRef } from "./InnerGroupRef";
export var RigidBodyRef = forwardRef(function (_a, ref) {
    var children = _a.children, controllerOptions = _a.controllerOptions, name = _a.name, position = _a.position, rotation = _a.rotation, userData = _a.userData, onCollisionEnter = _a.onCollisionEnter, rigidbodyType = _a.rigidbodyType, outerGroupRef = _a.outerGroupRef, innerGroupRef = _a.innerGroupRef, colliderRef = _a.colliderRef, url = _a.url, isActive = _a.isActive, currentAnimation = _a.currentAnimation, componentType = _a.componentType;
    var size = useGltfAndSize({ url: url }).size;
    var collider = calcCharacterColliderProps(size);
    var groundRay = useMemo(function () {
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
    var _b = useRapier(), rapier = _b.rapier, world = _b.world;
    useFrame(function () {
        var _a;
        groundRay.offset = vec3({
            x: 0,
            y: (collider === null || collider === void 0 ? void 0 : collider.halfHeight) ? -collider.halfHeight : -1,
            z: 0,
        });
        groundRay.length = 5;
        groundRay.rayCast = new rapier.Ray(groundRay.origin, groundRay.dir);
        groundRay.hit = world.castRay(groundRay.rayCast, groundRay.length, true, undefined, undefined);
        groundRay.parent = (_a = groundRay.hit) === null || _a === void 0 ? void 0 : _a.collider.parent();
    });
    var _c = useGLTF(url), scene = _c.scene, animations = _c.animations;
    var _d = useAnimations(animations), actions = _d.actions, animationRef = _d.ref;
    var worldContext = useContext(GaesupWorldContext);
    var controllerContext = useContext(GaesupControllerContext);
    if (isActive) {
        subscribeActions({
            type: componentType,
            groundRay: groundRay,
            animations: animations,
        });
        var cameraProps_1 = {
            state: null,
            worldContext: worldContext,
            controllerContext: controllerContext,
            controllerOptions: controllerOptions,
        };
        useFrame(function (state) {
            cameraProps_1.state = state;
        });
        Camera(cameraProps_1);
        calculation({
            outerGroupRef: outerGroupRef,
            innerGroupRef: innerGroupRef,
            rigidBodyRef: ref,
            colliderRef: colliderRef,
            groundRay: groundRay,
        });
    }
    playActions({
        type: componentType,
        actions: actions,
        animationRef: animationRef,
        currentAnimation: isActive ? undefined : currentAnimation,
        isActive: isActive,
    });
    var clone = useMemo(function () { return SkeletonUtils.clone(scene); }, [scene]);
    var nodes = useGraph(clone).nodes;
    var objectNode = Object.values(nodes).find(function (node) { return node.type === "Object3D"; });
    useFrame(function () {
        if (isActive || !position || !ref || !ref.current)
            return;
        ref.current.setTranslation(V3(THREE.MathUtils.lerp(ref.current.translation().x, position.x, controllerOptions.lerp.cameraPosition), THREE.MathUtils.lerp(ref.current.translation().y, position.y, controllerOptions.lerp.cameraPosition), THREE.MathUtils.lerp(ref.current.translation().z, position.z, controllerOptions.lerp.cameraPosition)), false);
    });
    return (_jsxs(RigidBody, { colliders: false, ref: ref, name: name, rotation: euler()
            .set(0, (rotation === null || rotation === void 0 ? void 0 : rotation.clone().y) || 0, 0)
            .clone(), userData: userData, onCollisionEnter: onCollisionEnter, type: rigidbodyType || (isActive ? "dynamic" : "fixed"), children: [_jsx(CapsuleCollider, { ref: colliderRef, args: [(size.y / 2 - size.x) * 1.2, size.x * 1.2], position: [0, (size.y / 2 + size.x / 2) * 1.2, 0] }), children, _jsx(InnerGroupRef, { objectNode: objectNode, animationRef: animationRef, nodes: nodes, ref: innerGroupRef, children: children })] }));
});
