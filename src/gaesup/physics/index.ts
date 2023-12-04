import { currentType, optionsType, propType } from "@gaesup/type";

import { RootState, useFrame } from "@react-three/fiber";
import { colliderAtom, colliderAtomType } from "@stores/collider";
import useCalcControl from "@stores/control";
import { currentAtom } from "@stores/current";
import { joyStickOriginAtom, joyStickOriginType } from "@stores/joystick";
import { optionsAtom } from "@stores/options";
import { statesAtom, statesType } from "@stores/states";
import { SetStateAction, useAtom, useAtomValue } from "jotai";
import airplaneCalculation from "./airplane";
import characterCalculation from "./character";
import vehicleCalculation from "./vehicle";

export type SetAtom<Args extends unknown[], Result> = (...args: Args) => Result;

export type calcPropType = propType & {
  current: [currentType, SetAtom<[SetStateAction<currentType>], void>];
  control: {
    [key: string]: boolean;
  };
  state?: RootState;
  checkCollision?: (delta: number) => void;
  option?: [optionsType, SetAtom<[SetStateAction<optionsType>], void>];
  states?: [statesType, SetAtom<[SetStateAction<statesType>], void>];
  collider?: [
    colliderAtomType,
    SetAtom<[SetStateAction<colliderAtomType>], void>,
  ];
  delta?: number;
  joystick?: [
    joyStickOriginType,
    SetAtom<[SetStateAction<joyStickOriginType>], void>,
  ];
};

export type cameraPropType = propType & {
  current: [currentType, SetAtom<[SetStateAction<currentType>], void>];
  control: {
    [key: string]: boolean;
  };
  state?: RootState;
  checkCollision?: (delta: number) => void;
  option: [optionsType, SetAtom<[SetStateAction<optionsType>], void>];
  delta?: number;
};

export default function calculation(prop: propType) {
  const options = useAtomValue(optionsAtom);
  const current = useAtom(currentAtom);
  const option = useAtom(optionsAtom);
  const joystick = useAtom(joyStickOriginAtom);
  const states = useAtom(statesAtom);
  const collider = useAtom(colliderAtom);
  const control = useCalcControl(prop);

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
      current,
      control,
      state,
      states,
      option,
      collider,
      joystick,
      delta,
    };
    if (options.mode === "vehicle") vehicleCalculation(calcProp);
    else if (options.mode === "normal") characterCalculation(calcProp);
    else if (options.mode === "airplane") airplaneCalculation(calcProp);
  });
}
