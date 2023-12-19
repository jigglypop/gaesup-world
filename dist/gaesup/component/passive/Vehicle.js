import { jsx as _jsx } from "react/jsx-runtime";
import calculation from "../../physics";
import { VehicleRef } from "../ref/vehicle";
export function Vehicle(_a) {
    var props = _a.props, refs = _a.refs;
    calculation(props);
    return _jsx(VehicleRef, { props: props, refs: refs });
}
