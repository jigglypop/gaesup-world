import { useFrame } from "@react-three/fiber";

import { useKeyboardControls } from "@react-three/drei";
import { useContext } from "react";
import { propType } from "../controller/type";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../stores/context";
import { GaesupControllerContext } from "../stores/context/controller";
import airplaneCalculation from "./airplane";
import characterCalculation from "./character";
import { calcPropType } from "./type";
import vehicleCalculation from "./vehicle";

export default function calculation(prop: propType) {
  const worldContext = useContext(GaesupWorldContext);
  const controllerContext = useContext(GaesupControllerContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const control = useKeyboardControls()[1]();
  const { mode } = worldContext;
  useFrame((state, delta) => {
    const { rigidBodyRef, outerGroupRef } = prop;
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current
    )
      return null;
    const calcProp: calcPropType = {
      ...prop,
      control,
      state,
      delta,
      worldContext,
      controllerContext,
      dispatch,
    };
    if (mode.type === "vehicle") vehicleCalculation(calcProp);
    else if (mode.type === "character") characterCalculation(calcProp);
    else if (mode.type === "airplane") airplaneCalculation(calcProp);
  });
}
