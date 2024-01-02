import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { WrapperRef } from "../common/WrapperRef";
import { VehicleCollider } from "./collider";
import { Wheels } from "./wheels";
export function VehicleRef(_a) {
    var props = _a.props, refs = _a.refs;
    var _b = useContext(GaesupWorldContext), url = _b.url, characterGltf = _b.characterGltf, vehicleGltf = _b.vehicleGltf;
    return (_jsxs(WrapperRef, { props: props, refs: refs, gltf: vehicleGltf, outerChildren: url.wheelUrl ? _jsx(Wheels, { props: props }) : _jsx(_Fragment, {}), children: [props.isRider && (_jsx(InnerGroupRef, { props: props, gltf: characterGltf, ref: refs.characterInnerRef })), _jsx(VehicleCollider, {})] }));
}
