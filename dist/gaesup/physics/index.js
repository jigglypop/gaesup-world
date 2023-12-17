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
import { useContext } from "react";
import { useRapier } from "@react-three/rapier";
import { GaesupControllerContext } from "../controller/context";
import { useFrame } from "@react-three/fiber";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
import airplaneCalculation from "./airplane";
import characterCalculation from "./character";
import check from "./check";
import vehicleCalculation from "./vehicle";
export default function calculation(prop) {
    var world = useRapier().world;
    var worldContext = useContext(GaesupWorldContext);
    var controllerContext = useContext(GaesupControllerContext);
    var dispatch = useContext(GaesupWorldDispatchContext);
    var mode = worldContext.mode;
    useFrame(function (state, delta) {
        var rigidBodyRef = prop.rigidBodyRef, outerGroupRef = prop.outerGroupRef, innerGroupRef = prop.innerGroupRef;
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current ||
            !innerGroupRef ||
            !innerGroupRef.current)
            return null;
        var calcProp = __assign(__assign({}, prop), { state: state, delta: delta, worldContext: worldContext, controllerContext: controllerContext, dispatch: dispatch, world: world });
        if (mode.type === "vehicle")
            vehicleCalculation(calcProp);
        else if (mode.type === "character")
            characterCalculation(calcProp);
        else if (mode.type === "airplane")
            airplaneCalculation(calcProp);
        check(calcProp);
    });
}