import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, forwardRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useGraph } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import playPassiveActions from "../../../animation/passiveActions";
export var InnerGroupRef = forwardRef(function (_a, ref) {
    var props = _a.props, url = _a.url;
    var _b = useGLTF(url), scene = _b.scene, animations = _b.animations;
    var animationRef = playPassiveActions({
        current: props.currentAnimation,
        animations: animations,
    }).animationRef;
    var clone = useMemo(function () { return SkeletonUtils.clone(scene); }, [scene]);
    var nodes = useGraph(clone).nodes;
    var objectNode = Object.values(nodes).find(function (node) { return node.type === "Object3D"; });
    return (_jsx(Suspense, { fallback: null, children: _jsxs("group", { receiveShadow: true, castShadow: true, ref: ref, userData: { intangible: true }, children: [objectNode && animationRef && (_jsx("primitive", { object: objectNode, visible: false, receiveShadow: true, castShadow: true, ref: animationRef })), Object.keys(nodes).map(function (name, key) {
                    var node = nodes[name];
                    if (node instanceof THREE.SkinnedMesh) {
                        return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry, skeleton: node.skeleton, userData: { intangible: true } }, key));
                    }
                    else if (node instanceof THREE.Mesh) {
                        return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry, userData: { intangible: true } }, key));
                    }
                })] }) }));
});
