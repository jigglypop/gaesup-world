import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { GaesupWorldContext } from "../../../world/context";
import { CharacterInnerGroupRef } from "../character/innerGltf";
import { VehicleCollider } from "./collider";
import { VehicleGroup } from "./group";
import { VehicleInnerGroupRef } from "./innerGltf";
import { VehicleRigidBody } from "./rigidbody";
import { Wheels } from "./wheels";
export function VehicleRef(_a) {
    var props = _a.props, refs = _a.refs;
    var url = useContext(GaesupWorldContext).url;
    return (_jsxs(VehicleGroup, { ref: refs.outerGroupRef, props: props, children: [_jsxs(VehicleRigidBody, { ref: refs.rigidBodyRef, props: props, children: [_jsx(VehicleCollider, {}), props.isRider && (_jsx(CharacterInnerGroupRef, { props: props, groundRay: props.groundRay, refs: refs, ref: refs.characterInnerRef })), _jsx(VehicleInnerGroupRef, { ref: refs.innerGroupRef })] }), url.wheelUrl && _jsx(Wheels, { props: props })] }));
}
