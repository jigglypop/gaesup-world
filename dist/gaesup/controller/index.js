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
import { useContext, useMemo, useReducer, useRef } from "react";
import Camera from "../camera";
import { Airplane } from "../component/Airplane";
import { Character } from "../component/Character";
import { Vehicle } from "../component/Vehicle";
import { GaesupWorldContext } from "../world/context";
import { GaesupControllerContext, GaesupControllerDispatchContext, gaesupControllerDefault, } from "./context";
import { gaesupControllerReducer } from "./context/reducer";
import initDebug from "./debug";
import initControllerProps from "./initialize";
export function GaesupController(props) {
    var capsuleColliderRef = useRef(null);
    var rigidBodyRef = useRef(null);
    var outerGroupRef = useRef(null);
    var innerGroupRef = useRef(null);
    var slopeRayOriginRef = useRef(null);
    var characterInnerRef = useRef(null);
    var jointRefs = useRef(null);
    var mode = useContext(GaesupWorldContext).mode;
    var _a = useReducer(gaesupControllerReducer, {
        cameraMode: Object.assign(gaesupControllerDefault.cameraMode, props.cameraMode || {}),
        cameraOption: Object.assign(gaesupControllerDefault.cameraOption, props.cameraOption || {}),
        perspectiveCamera: Object.assign(gaesupControllerDefault.perspectiveCamera, props.perspectiveCamera || {}),
        orthographicCamera: Object.assign(gaesupControllerDefault.orthographicCamera, props.orthographicCamera || {}),
        airplane: Object.assign(gaesupControllerDefault.airplane, props.airplane || {}),
        vehicle: Object.assign(gaesupControllerDefault.vehicle, props.vehicle || {}),
        character: Object.assign(gaesupControllerDefault.character, props.character || {}),
        callbacks: Object.assign(gaesupControllerDefault.callbacks, {
            onReady: props.onReady,
            onFrame: props.onFrame,
            onDestory: props.onDestory,
            onAnimate: props.onAnimate,
        }),
        refs: {
            capsuleColliderRef: capsuleColliderRef,
            rigidBodyRef: rigidBodyRef,
            outerGroupRef: outerGroupRef,
            innerGroupRef: innerGroupRef,
            slopeRayOriginRef: slopeRayOriginRef,
            characterInnerRef: characterInnerRef,
            jointRefs: jointRefs,
        },
        isRider: props.isRider !== null ? props.isRider : false,
    }), controller = _a[0], controllerDispatch = _a[1];
    var gaesupControl = useMemo(function () { return ({
        value: controller,
        dispatch: controllerDispatch,
    }); }, [
        controller.cameraMode,
        controller.cameraOption,
        controller.perspectiveCamera,
        controller.orthographicCamera,
        controller.airplane,
        controller.vehicle,
        controller.character,
        controller.callbacks,
        controller.isRider,
        controller.refs,
    ]);
    var refs = {
        capsuleColliderRef: capsuleColliderRef,
        rigidBodyRef: rigidBodyRef,
        outerGroupRef: outerGroupRef,
        innerGroupRef: innerGroupRef,
        slopeRayOriginRef: slopeRayOriginRef,
        characterInnerRef: characterInnerRef,
        jointRefs: jointRefs,
    };
    var prop = __assign(__assign(__assign(__assign({}, initControllerProps({
        controllerContext: gaesupControl.value,
        refs: refs,
    })), { children: props.children, groupProps: props.groupProps }), gaesupControl.value.callbacks), refs);
    initDebug({
        controllerContext: gaesupControl.value,
        controllerDispatch: gaesupControl.dispatch,
    });
    return (_jsxs(GaesupControllerContext.Provider, { value: gaesupControl.value, children: [_jsx(Camera, { refs: refs, prop: prop, control: prop.keyControl }), _jsxs(GaesupControllerDispatchContext.Provider, { value: gaesupControl.dispatch, children: [mode.type === "character" && _jsx(Character, { props: prop, refs: refs }), mode.type === "vehicle" && _jsx(Vehicle, { props: prop, refs: refs }), mode.type === "airplane" && _jsx(Airplane, { props: prop, refs: refs })] })] }));
}