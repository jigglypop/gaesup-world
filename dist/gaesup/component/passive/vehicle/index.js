import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef } from "react";
import mutation from "../../../mutation";
import { PassiveWrapperRef } from "../common/PassiveWrapperRef";
import { VehicleCollider } from "./collider";
import { Wheels } from "./wheels";
export function PassiveVehicle(_a) {
    var _b, _c, _d;
    var props = _a.props;
    var rigidBodyRef = useRef(null);
    var outerGroupRef = useRef(null);
    var innerGroupRef = useRef(null);
    var characterInnerRef = useRef(null);
    var refs = {
        rigidBodyRef: rigidBodyRef,
        outerGroupRef: outerGroupRef,
        innerGroupRef: innerGroupRef,
        characterInnerRef: characterInnerRef,
    };
    mutation({
        refs: refs,
        props: props,
        delta: 0.9,
    });
    return (_jsx(PassiveWrapperRef, { props: props, refs: refs, url: (_b = props.url) === null || _b === void 0 ? void 0 : _b.vehicleUrl, outerChildren: ((_c = props.url) === null || _c === void 0 ? void 0 : _c.wheelUrl) ? (_jsx(Wheels, { props: props, rigidBodyRef: rigidBodyRef, url: (_d = props.url) === null || _d === void 0 ? void 0 : _d.wheelUrl })) : (_jsx(_Fragment, {})), children: props.vehicleCollider && (_jsx(VehicleCollider, { collider: props.vehicleCollider, url: props.url })) }));
}
