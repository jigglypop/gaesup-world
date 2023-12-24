import { useFrame } from "@react-three/fiber";
import airplaneMutation from "./airplane";
import characterMutation from "./character";
import vehicleMutation from "./vehicle";
export default function mutation(_a) {
    var props = _a.props, refs = _a.refs, delta = _a.delta;
    var mode = props.mode;
    useFrame(function () {
        var state = props.state;
        var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef, innerGroupRef = refs.innerGroupRef;
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current ||
            !innerGroupRef ||
            !innerGroupRef.current)
            return null;
        var mutationProps = {
            outerGroupRef: outerGroupRef,
            rigidBodyRef: rigidBodyRef,
            innerGroupRef: innerGroupRef,
            position: state.position,
            euler: state.euler,
            quat: state.quat,
            rotation: state.rotation,
            delta: delta,
        };
        if (mode.type === "character")
            characterMutation(mutationProps);
        else if (mode.type === "airplane")
            airplaneMutation(mutationProps);
        else if (mode.type === "vehicle")
            vehicleMutation(mutationProps);
    });
}
