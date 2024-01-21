import { useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { useContext, useEffect } from "react";
import { GaesupControllerContext } from "../controller/context";
import { controllerInnerType } from "../controller/type";
import { useGaesupGltf } from "../hooks/useGaesupGltf";
import { V3 } from "../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../world/context";
import airplaneCalculation from "./airplane";
import characterCalculation from "./character";
import check from "./check";
import { calcPropType } from "./type";
import vehicleCalculation from "./vehicle";

export default function calculation(prop: controllerInnerType) {
  const { world } = useRapier();
  const worldContext = useContext(GaesupWorldContext);
  const controllerContext = useContext(GaesupControllerContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { mode, activeState, block } = worldContext;
  const { getSizesByUrls } = useGaesupGltf();
  // console.log(getSizesByUrls(controllerContext.urls));
  useEffect(() => {
    const { rigidBodyRef, innerGroupRef } = prop;
    if (rigidBodyRef.current && innerGroupRef.current) {
      rigidBodyRef.current.lockRotations(false, true);
      activeState.euler.set(0, 0, 0);
      rigidBodyRef.current.setTranslation(
        activeState.position.clone().add(V3(0, 2, 0)),
        true
      );
    }
  }, [mode.type]);

  useFrame((state, delta) => {
    const { rigidBodyRef, outerGroupRef, innerGroupRef } = prop;
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current ||
      !innerGroupRef ||
      !innerGroupRef.current
    )
      return null;
    if (block.control) return null;
    const calcProp: calcPropType = {
      ...prop,
      state,
      delta,
      worldContext,
      controllerContext,
      dispatch,
      world,
      matchSizes: getSizesByUrls(controllerContext?.urls),
    };
    if (mode.type === "vehicle") vehicleCalculation(calcProp);
    else if (mode.type === "character") characterCalculation(calcProp);
    else if (mode.type === "airplane") airplaneCalculation(calcProp);
    check(calcProp);
  });
}
