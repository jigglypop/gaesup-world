import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { GaesupControllerContext } from "../controller/context";
import { useGaesupGltf } from "../hooks/useGaesupGltf";
import { V3 } from "../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../world/context";
import airplaneCalculation from "./airplane";
import characterCalculation from "./character";
import check from "./check";
import vehicleCalculation from "./vehicle";
export default function calculation(_a) {
    var groundRay = _a.groundRay, rigidBodyRef = _a.rigidBodyRef, outerGroupRef = _a.outerGroupRef, innerGroupRef = _a.innerGroupRef, colliderRef = _a.colliderRef;
    var worldContext = useContext(GaesupWorldContext);
    var controllerContext = useContext(GaesupControllerContext);
    var dispatch = useContext(GaesupWorldDispatchContext);
    var mode = worldContext.mode, activeState = worldContext.activeState, block = worldContext.block;
    var getSizesByUrls = useGaesupGltf().getSizesByUrls;
    useEffect(function () {
        if (!rigidBodyRef || !innerGroupRef)
            return;
        if (rigidBodyRef.current && innerGroupRef.current) {
            rigidBodyRef.current.lockRotations(false, true);
            activeState.euler.set(0, 0, 0);
            rigidBodyRef.current.setTranslation(activeState.position.clone().add(V3(0, 5, 0)), true);
        }
    }, [mode.type]);
    useFrame(function (state, delta) {
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current ||
            !innerGroupRef ||
            !innerGroupRef.current)
            return null;
        if (block.control)
            return null;
        var calcProp = {
            rigidBodyRef: rigidBodyRef,
            outerGroupRef: outerGroupRef,
            innerGroupRef: innerGroupRef,
            colliderRef: colliderRef,
            groundRay: groundRay,
            state: state,
            delta: delta,
            worldContext: worldContext,
            controllerContext: controllerContext,
            dispatch: dispatch,
            matchSizes: getSizesByUrls(controllerContext === null || controllerContext === void 0 ? void 0 : controllerContext.urls),
        };
        if (mode.type === "vehicle")
            vehicleCalculation(calcProp);
        else if (mode.type === "character")
            characterCalculation(calcProp);
        else if (mode.type === "airplane")
            airplaneCalculation(calcProp);
        check(calcProp);
    });
}
