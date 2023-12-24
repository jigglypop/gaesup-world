import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { WrapperRef } from "../common/WrapperRef";
import { AirplaneCollider } from "./collider";
export function AirplaneRef(_a) {
    var props = _a.props, refs = _a.refs;
    var _b = useContext(GaesupWorldContext), characterGltf = _b.characterGltf, airplaneGltf = _b.airplaneGltf;
    return (_jsxs(WrapperRef, { props: props, refs: refs, gltf: airplaneGltf, children: [props.isRider && (_jsx(InnerGroupRef, { props: props, gltf: characterGltf, ref: refs.characterInnerRef })), _jsx(AirplaneCollider, { props: props })] }));
}
