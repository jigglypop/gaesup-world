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
import { useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { useContext, useEffect } from "react";
import { GaesupControllerContext } from "../controller/context";
import { useGaesupGltf } from "../hooks/useGaesupGltf";
import { V3 } from "../utils";
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
    var mode = worldContext.mode, activeState = worldContext.activeState, block = worldContext.block;
    var getSizesByUrls = useGaesupGltf().getSizesByUrls;
    useEffect(function () {
        var rigidBodyRef = prop.rigidBodyRef, innerGroupRef = prop.innerGroupRef;
        if (rigidBodyRef.current && innerGroupRef.current) {
            rigidBodyRef.current.lockRotations(false, true);
            activeState.euler.set(0, 0, 0);
            rigidBodyRef.current.setTranslation(activeState.position.clone().add(V3(0, 5, 0)), true);
        }
    }, [mode.type]);
    useFrame(function (state, delta) {
        var rigidBodyRef = prop.rigidBodyRef, outerGroupRef = prop.outerGroupRef, innerGroupRef = prop.innerGroupRef;
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current ||
            !innerGroupRef ||
            !innerGroupRef.current)
            return null;
        if (block.control)
            return null;
        var calcProp = __assign(__assign({}, prop), { state: state, delta: delta, worldContext: worldContext, controllerContext: controllerContext, dispatch: dispatch, world: world, matchSizes: getSizesByUrls(controllerContext === null || controllerContext === void 0 ? void 0 : controllerContext.urls) });
        if (mode.type === "vehicle")
            vehicleCalculation(calcProp);
        else if (mode.type === "character")
            characterCalculation(calcProp);
        else if (mode.type === "airplane")
            airplaneCalculation(calcProp);
        check(calcProp);
    });
}
