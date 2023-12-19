import { jsx as _jsx } from "react/jsx-runtime";
import calculation from "../../physics";
import { AirplaneRef } from "../ref/airplane";
export function Airplane(_a) {
    var props = _a.props, refs = _a.refs;
    calculation(props);
    return _jsx(AirplaneRef, { props: props, refs: refs });
}
