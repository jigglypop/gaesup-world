import { World } from "@dimforge/rapier3d-compat";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { useContext } from "react";
import { propType } from "../controller/type";
import { calcPropType } from "../physics/type";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../stores/context";
import { GaesupControllerContext } from "../stores/context/controller";
import ground from "./ground";
import moving from "./moving";
import rotate from "./rotate";
import slope from "./slope";

export type checkPropType = calcPropType & { world: World };

export default function check(prop: propType) {
  const { world } = useRapier();
  const worldContext = useContext(GaesupWorldContext);
  const controllerContext = useContext(GaesupControllerContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const control = useKeyboardControls()[1]();
  useFrame((state, delta) => {
    const { rigidBodyRef, outerGroupRef } = prop;
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current
    )
      return null;
    const calcProp: checkPropType = {
      ...prop,
      control,
      state,
      delta,
      worldContext,
      controllerContext,
      dispatch,
      world,
    };
    ground(calcProp);
    slope(calcProp);
    moving(calcProp);
    rotate(calcProp);
  });
}
