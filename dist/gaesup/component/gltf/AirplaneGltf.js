import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { forwardRef, useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
export var AirplaneInnerGroupRef = forwardRef(function (_, ref) {
    var gltf = useContext(GaesupWorldContext).airplaneGltf;
    var materials = gltf.materials, nodes = gltf.nodes;
    return (_jsx(_Fragment, { children: nodes && materials && (_jsx("group", { receiveShadow: true, castShadow: true, ref: ref, children: Object.keys(nodes).map(function (name, key) {
                if (nodes[name].type === "Mesh" ||
                    nodes[name].type === "SkinnedMesh") {
                    return (_jsx("mesh", { castShadow: true, receiveShadow: true, material: materials[name], geometry: nodes[name].geometry }, key));
                }
            }) })) }));
});
