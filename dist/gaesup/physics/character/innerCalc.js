var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { quat, vec3 } from "@react-three/rapier";
export default function innerCalc(prop) {
    var rigidBodyRef = prop.rigidBodyRef, innerGroupRef = prop.innerGroupRef, linearDamping = prop.controllerContext.character.linearDamping, _a = prop.worldContext, activeState = _a.activeState, states = _a.states, dispatch = prop.dispatch, delta = prop.delta;
    activeState.position = vec3(rigidBodyRef.current.translation());
    activeState.velocity = vec3(rigidBodyRef.current.linvel());
    if (states.isJumping || rigidBodyRef.current.linvel().y < 0) {
        rigidBodyRef.current.setLinearDamping(linearDamping);
    }
    else {
        rigidBodyRef.current.setLinearDamping(states.isNotMoving ? linearDamping * 5 : linearDamping);
    }
    rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    innerGroupRef.current.quaternion.rotateTowards(quat().setFromEuler(activeState.euler), 10 * delta);
    dispatch({
        type: "update",
        payload: {
            activeState: __assign({}, activeState),
        },
    });
}
