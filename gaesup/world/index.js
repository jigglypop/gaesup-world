"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { GaesupWorldContext, GaesupWorldDispatchContext } from "./context";
import initGaesupWorld from "./initalize";
import "./style.css";
export function GaesupWorld(props) {
    const { gaesupProps } = initGaesupWorld(props);
    return (_jsx(GaesupWorldContext.Provider, { value: gaesupProps.value, children: _jsx(GaesupWorldDispatchContext.Provider, { value: gaesupProps.dispatch, children: props.children }) }));
}
