import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions from "../../../animation/actions";
export var PartsGroupRef = function (_a) {
    var url = _a.url, isActive = _a.isActive, componentType = _a.componentType, currentAnimation = _a.currentAnimation;
    var _b = useGLTF(url), scene = _b.scene, animations = _b.animations;
    var clone = useMemo(function () { return SkeletonUtils.clone(scene); }, [scene]);
    var _c = useAnimations(animations), actions = _c.actions, ref = _c.ref;
    var nodes = useGraph(clone).nodes;
    var objectNode = Object.values(nodes).find(function (node) { return node.type === "Object3D"; });
    playActions({
        type: componentType,
        actions: actions,
        animationRef: ref,
        currentAnimation: isActive ? undefined : currentAnimation,
        isActive: isActive,
    });
    return (_jsxs(_Fragment, { children: [_jsx("primitive", { object: objectNode, visible: false, receiveShadow: true, castShadow: true, ref: ref }), Object.keys(nodes).map(function (name, key) {
                var node = nodes[name];
                if (node instanceof THREE.SkinnedMesh) {
                    return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry, skeleton: node.skeleton }, key));
                }
                else if (node instanceof THREE.Mesh) {
                    return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry }, key));
                }
            })] }));
};
