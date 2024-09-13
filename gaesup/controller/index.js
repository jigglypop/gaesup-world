"use client";
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useReducer, useRef } from "react";
import { useContextBridge } from "@react-three/drei";
import { GaesupComponent } from "../component";
import { GaesupWorldContext } from "../world/context";
import { GaesupControllerContext, GaesupControllerDispatchContext, gaesupControllerDefault, } from "./context";
import { gaesupControllerReducer } from "./context/reducer";
import initControllerProps from "./initialize";
export function GaesupController(props) {
    return (_jsx(_Fragment, { children: _jsx(GaesupControllerInner, Object.assign({}, props, { children: props.children })) }));
}
export function GaesupControllerInner(props) {
    const colliderRef = useRef(null);
    const rigidBodyRef = useRef(null);
    const outerGroupRef = useRef(null);
    const innerGroupRef = useRef(null);
    const characterInnerRef = useRef(null);
    const passiveRigidBodyRef = useRef(null);
    const [controller, controllerDispatch] = useReducer(gaesupControllerReducer, {
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
            colliderRef,
            rigidBodyRef,
            outerGroupRef,
            innerGroupRef,
            characterInnerRef,
        },
        controllerOptions: Object.assign(gaesupControllerDefault.controllerOptions, props.controllerOptions || {}),
    });
    const gaesupControl = useMemo(() => ({
        value: controller,
        dispatch: controllerDispatch,
    }), []);
    const refs = useMemo(() => {
        return {
            colliderRef,
            rigidBodyRef,
            outerGroupRef,
            innerGroupRef,
            characterInnerRef,
            passiveRigidBodyRef,
        };
    }, []);
    const prop = Object.assign(Object.assign(Object.assign(Object.assign({}, initControllerProps({
        refs,
    })), { children: props.children, groupProps: props.groupProps, rigidBodyProps: props.rigidBodyProps, controllerOptions: gaesupControl.value.controllerOptions, parts: props.parts }), gaesupControl.value.callbacks), refs);
    const ContextBridge = useContextBridge(GaesupWorldContext, GaesupControllerContext);
    return (_jsx(ContextBridge, { children: _jsx(GaesupControllerContext.Provider, { value: gaesupControl.value, children: _jsx(GaesupControllerDispatchContext.Provider, { value: gaesupControl.dispatch, children: _jsx(GaesupComponent, { props: prop, refs: refs }) }) }) }));
}
