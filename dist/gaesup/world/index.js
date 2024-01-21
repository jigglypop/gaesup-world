import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Leva } from "leva";
import { GaesupWorldContext, GaesupWorldDispatchContext } from "./context";
import initGaesupWorld from "./initalize";
import "./style.css";
export function GaesupWorld(props) {
    var gaesupProps = initGaesupWorld(props).gaesupProps;
    return (_jsx(GaesupWorldContext.Provider, { value: gaesupProps.value, children: _jsxs(GaesupWorldDispatchContext.Provider, { value: gaesupProps.dispatch, children: [_jsx(Leva, { collapsed: true }), props.children] }) }));
}
