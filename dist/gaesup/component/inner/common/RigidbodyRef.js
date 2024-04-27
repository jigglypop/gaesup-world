var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useGraph } from "@react-three/fiber";
import { CapsuleCollider, RigidBody, euler, } from "@react-three/rapier";
import { forwardRef, useContext, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions, { subscribeActions } from "../../../animation/actions";
import Camera from "../../../camera";
import { GaesupControllerContext } from "../../../controller/context";
import initCallback from "../../../controller/initialize/callback";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import calculation from "../../../physics";
import { V3 } from "../../../utils";
import { GaesupWorldContext } from "../../../world/context";
import { InnerGroupRef } from "./InnerGroupRef";
import { setGroundRay } from "./setGroundRay";
export var RigidBodyRef = forwardRef(function (props, ref) {
    var _a;
    var size = useGltfAndSize({ url: props.url }).size;
    props.groundRay &&
        setGroundRay({
            groundRay: props.groundRay,
            length: 0.5,
            colliderRef: props.colliderRef,
        });
    var _b = useGLTF(props.url), scene = _b.scene, animations = _b.animations;
    var _c = useAnimations(animations), actions = _c.actions, animationRef = _c.ref;
    var worldContext = useContext(GaesupWorldContext);
    var controllerContext = useContext(GaesupControllerContext);
    if (props.isActive) {
        subscribeActions({
            type: props.componentType,
            groundRay: props.groundRay,
            animations: animations,
        });
        var cameraProps_1 = {
            state: null,
            worldContext: worldContext,
            controllerContext: controllerContext,
            controllerOptions: props.controllerOptions,
        };
        useFrame(function (state) {
            cameraProps_1.state = state;
        });
        Camera(cameraProps_1);
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
        actions: actions,
        animationRef: animationRef,
        currentAnimation: props.isActive ? undefined : props.currentAnimation,
        isActive: props.isActive,
    });
    initCallback({
        props: props,
        actions: actions,
        componentType: props.componentType,
    });
    var clone = useMemo(function () { return SkeletonUtils.clone(scene); }, [scene]);
    var nodes = useGraph(clone).nodes;
    var objectNode = Object.values(nodes).find(function (node) { return node.type === "Object3D"; });
    useFrame(function () {
        if (props.isActive || !props.position || !ref || !ref.current)
            return;
        ref.current.setTranslation(V3(THREE.MathUtils.lerp(ref.current.translation().x, props.position.x, props.controllerOptions.lerp.cameraPosition), THREE.MathUtils.lerp(ref.current.translation().y, props.position.y, props.controllerOptions.lerp.cameraPosition), THREE.MathUtils.lerp(ref.current.translation().z, props.position.z, props.controllerOptions.lerp.cameraPosition)), false);
    });
    return (_jsxs(RigidBody, __assign({ colliders: false, ref: ref, name: props.name, rotation: euler()
            .set(0, ((_a = props.rotation) === null || _a === void 0 ? void 0 : _a.clone().y) || 0, 0)
            .clone(), userData: props.userData, type: props.rigidbodyType || (props.isActive ? "dynamic" : "fixed"), sensor: props.sensor, onIntersectionEnter: props.onIntersectionEnter, onCollisionEnter: props.onCollisionEnter }, props.rigidBodyProps, { children: [_jsx(CapsuleCollider, { ref: props.colliderRef, args: [(size.y / 2 - size.x) * 1.2, size.x * 1.2], position: [0, (size.y / 2 + size.x / 2) * 1.2, 0] }), props.children, _jsx(InnerGroupRef, { objectNode: objectNode, animationRef: animationRef, nodes: nodes, ref: props.innerGroupRef, isActive: props.isActive, isRiderOn: props.isRiderOn, enableRiding: props.enableRiding, ridingUrl: props.ridingUrl, offset: props.offset, children: props.children })] })));
});
