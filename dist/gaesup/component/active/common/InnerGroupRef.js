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
import { Suspense, forwardRef, useContext, useMemo } from "react";
import { useGraph } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { GaesupWorldContext } from "../../../world/context";
import { RiderGroup } from "./RiderGroupRef";
export var InnerGroupRef = forwardRef(function (_a, ref) {
    var props = _a.props, animationRef = _a.animationRef, gltf = _a.gltf;
    var _b = useContext(GaesupWorldContext), mode = _b.mode, states = _b.states;
    var scene = gltf.scene;
    var clone = useMemo(function () { return SkeletonUtils.clone(scene); }, [scene]);
    var nodes = useGraph(clone).nodes;
    var objectNode = Object.values(nodes).find(function (node) { return node.type === "Object3D"; });
    return (_jsx(Suspense, { fallback: null, children: _jsxs("group", __assign({ receiveShadow: true, castShadow: true }, props.groupProps, { ref: ref, children: [mode.type !== "character" && states.isRiderOn && (_jsx(RiderGroup, { props: props })), objectNode && animationRef && (_jsx("primitive", { object: objectNode, visible: false, receiveShadow: true, castShadow: true, ref: animationRef })), Object.keys(nodes).map(function (name, key) {
                    var node = nodes[name];
                    if (node instanceof THREE.SkinnedMesh) {
                        return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry, skeleton: node.skeleton }, key));
                    }
                    else if (node instanceof THREE.Mesh) {
                        return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: node.material, geometry: node.geometry }, key));
                    }
                })] })) }));
});
