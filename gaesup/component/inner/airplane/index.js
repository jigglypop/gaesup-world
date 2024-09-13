import { jsx as _jsx } from "react/jsx-runtime";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
export function AirplaneInnerRef(props) {
    const { rigidBodyRef, outerGroupRef } = props;
    return (_jsx(OuterGroupRef, { ref: outerGroupRef, children: _jsx(RigidBodyRef, Object.assign({ ref: rigidBodyRef, name: props.name, componentType: "airplane", ridingUrl: props.ridingUrl }, props, { children: props.children })) }));
}
