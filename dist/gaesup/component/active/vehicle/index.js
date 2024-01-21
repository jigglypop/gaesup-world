import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
import { WrapperRef } from "../common/WrapperRef";
import { VehicleCollider } from "./collider";
import { Wheels } from "./wheels";
export function VehicleRef(_a) {
    var props = _a.props, refs = _a.refs;
    var _b = useContext(GaesupWorldContext), url = _b.url, vehicleGltf = _b.vehicleGltf;
    return (_jsx(WrapperRef, { props: props, refs: refs, gltf: vehicleGltf, outerChildren: url.wheelUrl ? _jsx(Wheels, { props: props }) : _jsx(_Fragment, {}), children: _jsx(VehicleCollider, {}) }));
}
