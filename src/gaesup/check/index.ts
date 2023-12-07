import { World } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import { useAtom } from "jotai";
import { useContext } from "react";
import { calcPropType } from "../physics";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
  gaesupDisptachType,
  gaesupWorldPropType,
} from "../stores/context";
import useCalcControl from "../stores/control";
import { currentAtom } from "../stores/current";
import { joyStickOriginAtom } from "../stores/joystick";
import { optionsAtom } from "../stores/options";
import { statesAtom } from "../stores/states";
import { propType } from "../type";
import checkIsRotate from "./checkIsRotate";
import checkMoving from "./checkMoving";
import checkOnMovingObject from "./checkOnMovingObject";
import checkOnTheGround from "./checkOnTheGround";
import checkOnTheSlope from "./checkOnTheSlope";

export type checkPropType = calcPropType & { world: World };

export default function check(prop: propType) {
  const { world } = useRapier();
  const current = useAtom(currentAtom);
  const option = useAtom(optionsAtom);
  const joystick = useAtom(joyStickOriginAtom);
  const states = useAtom(statesAtom);
  const control = useCalcControl(prop);
  const context = useContext<gaesupWorldPropType>(GaesupWorldContext);
  const dispatch = useContext<gaesupDisptachType>(GaesupWorldDispatchContext);
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
      current,
      control,
      state,
      states,
      option,
      joystick,
      delta,
      context,
      dispatch,
      world,
    };
    checkOnTheGround(calcProp);
    checkOnTheSlope(calcProp);
    checkOnMovingObject(calcProp);
    checkMoving(calcProp);
    checkIsRotate(calcProp);
  });
}
