import { useFrame } from "@react-three/fiber";
import characterMutation from "./character";
export default function mutation(props) {
    var mode = props.mode;
    useFrame(function () {
        var rigidBodyRef = props.rigidBodyRef, outerGroupRef = props.outerGroupRef, state = props.state, delta = props.delta;
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current)
            return null;
        var mutationProps = {
            outerGroupRef: outerGroupRef,
            rigidBodyRef: rigidBodyRef,
            position: state.position,
            euler: state.euler,
            quat: state.quat,
            delta: delta,
        };
        characterMutation(mutationProps);
    });
}
