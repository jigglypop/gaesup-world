import { useContext, useEffect } from "react";

import { useRapier } from "@react-three/rapier";
import { GaesupControllerContext } from "../controller/context";

import { useFrame } from "@react-three/fiber";
import { controllerInnerType } from "../controller/type";
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
  const { mode, activeState } = worldContext;

  useEffect(() => {
    const { rigidBodyRef } = prop;
    if (rigidBodyRef.current)
      rigidBodyRef.current?.setTranslation(
        activeState.position.add(V3(0, 1, 0)),
        false
      );
  }, []);

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
