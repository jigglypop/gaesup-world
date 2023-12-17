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
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { forwardRef, useContext } from "react";
import playActions from "../../animation/actions";
import initCallback from "../../initial/callback";
import { GaesupWorldContext } from "../../world/context";
export var InnerGroupRef = forwardRef(function (_, ref) {
    return _jsx("group", { ref: ref, visible: false });
});
export var CharacterInnerGroupRef = forwardRef(function (_a, ref) {
    var props = _a.props, groundRay = _a.groundRay, refs = _a.refs;
    var gltf = useContext(GaesupWorldContext).characterGltf;
    var materials = gltf.materials, nodes = gltf.nodes;
    var _b = useContext(GaesupWorldContext), characterCollider = _b.characterCollider, vehicleCollider = _b.vehicleCollider;
    initCallback({
        props: props,
    });
    playActions({
        outerGroupRef: refs.outerGroupRef,
        groundRay: groundRay,
        isRider: props.isRider,
    });
    return (_jsx(_Fragment, { children: nodes && materials && (_jsxs("group", __assign({ receiveShadow: true, castShadow: true }, props.groupProps, { position: [
                0,
                props.isRider
                    ? vehicleCollider.vehicleSizeY / 2
                    : -characterCollider.height,
                0,
            ], ref: ref, children: [Object.values(nodes).find(function (node) { return node.type === "Object3D"; }) && (_jsx("primitive", { object: Object.values(nodes).find(function (node) { return node.type === "Object3D"; }), visible: false, receiveShadow: true, castShadow: true })), Object.keys(nodes).map(function (name, key) {
                    if (nodes[name].type === "SkinnedMesh") {
                        return (_jsx("skinnedMesh", { castShadow: true, receiveShadow: true, material: materials[name], geometry: nodes[name].geometry, skeleton: nodes[name].skeleton }, key));
                    }
                })] }))) }));
});
