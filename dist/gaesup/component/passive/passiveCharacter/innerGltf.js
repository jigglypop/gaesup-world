import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { forwardRef, useMemo } from "react";
import { useGraph, useLoader } from "@react-three/fiber";
import { SkeletonUtils } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import playPassiveActions from "../../../animation/passiveActions";
export var PassiveCharacterInnerGroupRef = forwardRef(function (_a, ref) {
    var url = _a.url, current = _a.current;
    var _b = useLoader(GLTFLoader, url), materials = _b.materials, scene = _b.scene, animations = _b.animations;
    var clone = useMemo(function () { return SkeletonUtils.clone(scene); }, [scene]);
    var nodes = useGraph(clone).nodes;
    var animationRef = playPassiveActions({
        current: current,
        animations: animations,
    }).animationRef;
    return (_jsx(_Fragment, { children: nodes && materials && (_jsxs("group", { receiveShadow: true, castShadow: true, ref: ref, children: [Object.values(nodes).find(function (node) { return node.type === "Object3D"; }) && (_jsx("primitive", { object: Object.values(nodes).find(function (node) { return node.type === "Object3D"; }), visible: false, receiveShadow: true, castShadow: true, ref: animationRef })), Object.keys(nodes).map(function (name, key) {
                    if (nodes[name].type === "SkinnedMesh") {
                        return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: materials[name], geometry: nodes[name].geometry, skeleton: nodes[name].skeleton }, key));
                    }
                    else if (nodes[name].type === "Mesh") {
                        return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: materials[name], geometry: nodes[name].geometry }, key));
                    }
                })] })) }));
});
