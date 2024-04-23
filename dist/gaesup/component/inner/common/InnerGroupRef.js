import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import * as THREE from "three";
import RiderRef from "../rider";
export var InnerGroupRef = forwardRef(function (props, ref) {
    return (_jsxs("group", { receiveShadow: true, castShadow: true, ref: ref, userData: { intangible: true }, children: [props.isRiderOn &&
                props.enableRiding &&
                props.isActive &&
                props.ridingUrl && (_jsx(RiderRef, { url: props.ridingUrl, offset: props.offset })), props.children, props.objectNode && props.animationRef && (_jsx("primitive", { object: props.objectNode, visible: false, receiveShadow: true, castShadow: true, ref: props.animationRef })), Object.keys(props.nodes).map(function (name, key) {
                var node = props.nodes[name];
                if (node instanceof THREE.SkinnedMesh) {
                    return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry, skeleton: node.skeleton }, key));
                }
                else if (node instanceof THREE.Mesh) {
                    return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry }, key));
                }
            })] }));
});
