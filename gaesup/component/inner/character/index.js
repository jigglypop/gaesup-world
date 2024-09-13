import { jsx as _jsx } from "react/jsx-runtime";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
export function CharacterInnerRef(props) {
    const { outerGroupRef } = props;
    return (_jsx(OuterGroupRef, { ref: outerGroupRef, children: _jsx(RigidBodyRef, Object.assign({ name: "character", url: props.url, controllerOptions: props.controllerOptions, ref: props.rigidBodyRef, groundRay: props.groundRay, isNotColliding: props.isNotColliding }, props, { children: props.children })) }));
}
