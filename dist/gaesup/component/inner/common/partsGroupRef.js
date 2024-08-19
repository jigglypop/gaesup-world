import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playActions from "../../../animation/actions";
import { isEqual } from "../../../utils/getTag";
export var PartsGroupRef = function (_a) {
    var url = _a.url, isActive = _a.isActive, componentType = _a.componentType, currentAnimation = _a.currentAnimation, color = _a.color;
    var _b = useGLTF(url), scene = _b.scene, animations = _b.animations;
    var clone = useMemo(function () { return SkeletonUtils.clone(scene); }, [scene, color]);
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
                var node = nodes === null || nodes === void 0 ? void 0 : nodes[name];
                if (node instanceof THREE.SkinnedMesh) {
                    if (isEqual("color", node) && color) {
                        return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, geometry: node.geometry, skeleton: node.skeleton, children: _jsx("meshStandardMaterial", { color: new THREE.Color(color) }) }, key));
                    }
                    else {
                        return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry, skeleton: node.skeleton }, key));
                    }
                }
                else if (node instanceof THREE.Mesh &&
                    isEqual("color", node) &&
                    color) {
                    if (isEqual("color", node) && color) {
                        return (_jsx("mesh", { castShadow: true, receiveShadow: true, geometry: node.geometry, children: _jsx("meshStandardMaterial", { color: new THREE.Color(color) }) }, key));
                    }
                    else {
                        return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry }, key));
                    }
                }
            })] }));
};
