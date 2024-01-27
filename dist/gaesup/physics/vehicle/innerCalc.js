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
    var rigidBodyRef = prop.rigidBodyRef, activeState = prop.worldContext.activeState, dispatch = prop.dispatch;
    activeState.position = vec3(rigidBodyRef.current.translation());
    activeState.velocity = vec3(rigidBodyRef.current.linvel());
    rigidBodyRef.current.setRotation(quat().setFromEuler(activeState.euler.clone()), false);
    dispatch({
        type: "update",
        payload: {
            activeState: __assign({}, activeState),
        },
    });
}
