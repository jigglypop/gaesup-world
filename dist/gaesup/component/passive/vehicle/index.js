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
import { useRef } from "react";
import { VehicleInnerRef } from "../../inner/vehicle";
export function PassiveVehicle(props) {
    var rigidBodyRef = useRef(null);
    var outerGroupRef = useRef(null);
    var innerGroupRef = useRef(null);
    var colliderRef = useRef(null);
    var refs = {
        rigidBodyRef: rigidBodyRef,
        outerGroupRef: outerGroupRef,
        innerGroupRef: innerGroupRef,
        colliderRef: colliderRef,
    };
    return (_jsx(VehicleInnerRef, __assign({ outerGroupRef: outerGroupRef, innerGroupRef: innerGroupRef, rigidBodyRef: rigidBodyRef, colliderRef: colliderRef, refs: refs, userData: { intangible: true }, componentType: "vehicle", name: "vehicle", isRiderOn: props.isRiderOn, enableRiding: props.enableRiding, isActive: false }, props, { children: props.children })));
}
