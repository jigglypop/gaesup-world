import { jsx as _jsx } from "react/jsx-runtime";
import initGaesupWorld from "../initial/gaesupWorld";
import { GaesupWorldContext, GaesupWorldDispatchContext } from "./context";
export function GaesupWorld(props) {
    var gaesupProps = initGaesupWorld(props).gaesupProps;
    return (_jsx(GaesupWorldContext.Provider, { value: gaesupProps.value, children: _jsx(GaesupWorldDispatchContext.Provider, { value: gaesupProps.dispatch, children: props.children }) }));
}
