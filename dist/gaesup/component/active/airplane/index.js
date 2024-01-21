import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
import { WrapperRef } from "../common/WrapperRef";
import { AirplaneCollider } from "./collider";
export function AirplaneRef(_a) {
    var props = _a.props, refs = _a.refs;
    var airplaneGltf = useContext(GaesupWorldContext).airplaneGltf;
    return (_jsx(WrapperRef, { props: props, refs: refs, gltf: airplaneGltf, children: _jsx(AirplaneCollider, { props: props }) }));
}
