import { jsx as _jsx } from "react/jsx-runtime";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
export function VehicleInnerRef(props) {
    const { rigidBodyRef, outerGroupRef } = props;
    // const { size } = useGltfAndSize({
    //   url: props.url,
    // });
    return (_jsx(OuterGroupRef, { ref: outerGroupRef, children: _jsx(RigidBodyRef, Object.assign({ ref: rigidBodyRef, name: props.name, componentType: "vehicle", ridingUrl: props.ridingUrl }, props, { children: props.children })) }));
}
