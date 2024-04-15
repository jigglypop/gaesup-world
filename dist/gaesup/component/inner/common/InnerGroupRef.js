import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useGraph } from "@react-three/fiber";
import { forwardRef, useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { useAnimations, useGLTF } from "@react-three/drei";
import playActions from "../../../animation/actions";
export var InnerGroupRef = forwardRef(function (_a, ref) {
    var children = _a.children, type = _a.type, currentAnimation = _a.currentAnimation, url = _a.url, rotation = _a.rotation;
    var _b = useGLTF(url), scene = _b.scene, animations = _b.animations;
    var animationResult = useAnimations(animations);
    var animationRef = playActions({
        type: type,
        animationResult: animationResult,
        currentAnimation: currentAnimation,
    }).animationRef;
    var clone = useMemo(function () { return SkeletonUtils.clone(scene); }, [scene]);
    var nodes = useGraph(clone).nodes;
    var objectNode = Object.values(nodes).find(function (node) { return node.type === "Object3D"; });
    return (_jsxs("group", { receiveShadow: true, castShadow: true, ref: ref, rotation: rotation, userData: { intangible: true }, children: [children, objectNode && animationRef && (_jsx("primitive", { object: objectNode, visible: false, receiveShadow: true, castShadow: true, ref: animationRef })), Object.keys(nodes).map(function (name, key) {
                var node = nodes[name];
                if (node instanceof THREE.SkinnedMesh) {
                    return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry, skeleton: node.skeleton }, key));
                }
                else if (node instanceof THREE.Mesh) {
                    return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry }, key));
                }
            })] }));
});
