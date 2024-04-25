"use client";
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
import { useContext, useMemo, useReducer, useRef } from "react";
import { KeyboardControls, useContextBridge } from "@react-three/drei";
import { GaesupComponent } from "../component";
import { GaesupWorldContext } from "../world/context";
import { GaesupControllerContext, GaesupControllerDispatchContext, gaesupControllerDefault, } from "./context";
import { gaesupControllerReducer } from "./context/reducer";
import initDebug from "./debug";
import initControllerProps from "./initialize";
export function GaesupController(props) {
    var keyBoardMap = useContext(GaesupWorldContext).keyBoardMap;
    return (_jsx(KeyboardControls, { map: keyBoardMap, children: _jsx(GaesupControllerInner, __assign({}, props, { children: props.children })) }));
}
export function GaesupControllerInner(props) {
    var colliderRef = useRef(null);
    var rigidBodyRef = useRef(null);
    var outerGroupRef = useRef(null);
    var innerGroupRef = useRef(null);
    var characterInnerRef = useRef(null);
    var passiveRigidBodyRef = useRef(null);
    var _a = useReducer(gaesupControllerReducer, {
        airplane: Object.assign(gaesupControllerDefault.airplane, props.airplane || {}),
        vehicle: Object.assign(gaesupControllerDefault.vehicle, props.vehicle || {}),
        character: Object.assign(gaesupControllerDefault.character, props.character || {}),
        callbacks: Object.assign(gaesupControllerDefault.callbacks, {
            onReady: props.onReady,
            onFrame: props.onFrame,
            onDestory: props.onDestory,
            onAnimate: props.onAnimate,
        }),
        urls: Object.assign(gaesupControllerDefault.urls, props.urls || {}),
        refs: {
            colliderRef: colliderRef,
            rigidBodyRef: rigidBodyRef,
            outerGroupRef: outerGroupRef,
            innerGroupRef: innerGroupRef,
            characterInnerRef: characterInnerRef,
        },
    }), controller = _a[0], controllerDispatch = _a[1];
    var gaesupControl = useMemo(function () { return ({
        value: controller,
        dispatch: controllerDispatch,
    }); }, []);
    var refs = useMemo(function () {
        return {
            colliderRef: colliderRef,
            rigidBodyRef: rigidBodyRef,
            outerGroupRef: outerGroupRef,
            innerGroupRef: innerGroupRef,
            characterInnerRef: characterInnerRef,
            passiveRigidBodyRef: passiveRigidBodyRef,
        };
    }, []);
    var prop = __assign(__assign(__assign(__assign({}, initControllerProps({
        refs: refs,
    })), { children: props.children, groupProps: props.groupProps }), gaesupControl.value.callbacks), refs);
    initDebug({
        controllerContext: gaesupControl.value,
        controllerDispatch: gaesupControl.dispatch,
    });
    var ContextBridge = useContextBridge(GaesupWorldContext, GaesupControllerContext);
    return (_jsx(ContextBridge, { children: _jsx(GaesupControllerContext.Provider, { value: gaesupControl.value, children: _jsx(GaesupControllerDispatchContext.Provider, { value: gaesupControl.dispatch, children: _jsx(GaesupComponent, { props: prop, refs: refs, urls: props.urls }) }) }) }));
}
