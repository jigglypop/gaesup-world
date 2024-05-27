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
import { jsx as _jsx } from "react/jsx-runtime";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
export function CharacterInnerRef(props) {
    var outerGroupRef = props.outerGroupRef;
    return (_jsx(OuterGroupRef, { ref: outerGroupRef, children: _jsx(RigidBodyRef, __assign({ name: "character", url: props.url, controllerOptions: props.controllerOptions, ref: props.rigidBodyRef, groundRay: props.groundRay, parts: props.parts }, props, { children: props.children })) }));
}
