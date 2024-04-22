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
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext, useMemo, useRef } from "react";
import { GaesupWorldContext } from "../../../world/context";
import { VehicleInnerRef } from "../../inner/vehicle";
export function PassiveVehicle(props) {
    var states = useContext(GaesupWorldContext).states;
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
    var memorized = useMemo(function () {
        return (_jsx(VehicleInnerRef, __assign({ isActive: false, componentType: "vehicle", name: "vehicle", controllerOptions: props.controllerOptions || {
                lerp: {
                    cameraTurn: 1,
                    cameraPosition: 1,
                },
            }, position: props.position.clone(), rotation: props.rotation.clone(), currentAnimation: props.currentAnimation }, props, refs, { children: props.children })));
    }, [props.position, props.rotation, props.currentAnimation]);
    return _jsx(_Fragment, { children: memorized });
}
