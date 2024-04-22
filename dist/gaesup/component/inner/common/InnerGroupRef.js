import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import * as THREE from "three";
export var InnerGroupRef = forwardRef(function (_a, ref) {
    var children = _a.children, objectNode = _a.objectNode, animationRef = _a.animationRef, nodes = _a.nodes;
    return (_jsxs("group", { receiveShadow: true, castShadow: true, ref: ref, userData: { intangible: true }, children: [children, objectNode && animationRef && (_jsx("primitive", { object: objectNode, visible: false, receiveShadow: true, castShadow: true, ref: animationRef })), Object.keys(nodes).map(function (name, key) {
                var node = nodes[name];
                if (node instanceof THREE.SkinnedMesh) {
                    return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry, skeleton: node.skeleton }, key));
                }
                else if (node instanceof THREE.Mesh) {
                    return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry }, key));
                }
            })] }));
});
