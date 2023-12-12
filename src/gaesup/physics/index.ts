import { useFrame } from "@react-three/fiber";

import { useContext } from "react";
import { propType } from "../controller/type";

import { useRapier } from "@react-three/rapier";
import { GaesupControllerContext } from "../stores/context/controller";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../stores/context/gaesupworld";
import airplaneCalculation from "./airplane";
import characterCalculation from "./character";
import check from "./check";
import { calcPropType } from "./type";
import vehicleCalculation from "./vehicle";

export default function calculation(prop: propType) {
  const { world } = useRapier();
  const worldContext = useContext(GaesupWorldContext);
  const controllerContext = useContext(GaesupControllerContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { mode } = worldContext;
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
    const calcProp: calcPropType = {
      ...prop,
      state,
      delta,
      worldContext,
      controllerContext,
      dispatch,
      world,
    };
    if (mode.type === "vehicle") vehicleCalculation(calcProp);
    else if (mode.type === "character") characterCalculation(calcProp);
    else if (mode.type === "airplane") airplaneCalculation(calcProp);
    check(calcProp);
  });
}