import { useFrame } from "@react-three/fiber";
import { useContext, useEffect } from "react";
import { GaesupControllerContext } from "../controller/context";
import { useGaesupGltf } from "../hooks/useGaesupGltf";
import { V3 } from "../utils";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../world/context";
import airplaneCalculation from "./airplane";
import characterCalculation from "./character";
import check from "./check";
import { calcType } from "./type";
import vehicleCalculation from "./vehicle";

export default function calculation({
  groundRay,
  rigidBodyRef,
  outerGroupRef,
  innerGroupRef,
  colliderRef,
}) {
  const worldContext = useContext(GaesupWorldContext);
  const controllerContext = useContext(GaesupControllerContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { mode, activeState, block } = worldContext;
  const { getSizesByUrls } = useGaesupGltf();
  useEffect(() => {
    if (!rigidBodyRef || !innerGroupRef) return;
    if (rigidBodyRef.current && innerGroupRef.current) {
      rigidBodyRef.current.lockRotations(false, true);
      activeState.euler.set(0, 0, 0);
      rigidBodyRef.current.setTranslation(
        activeState.position.clone().add(V3(0, 5, 0)),
        true
      );
    }
  }, [mode.type]);

  useEffect(() => {
    if (rigidBodyRef && rigidBodyRef.current) {
      if (block.control) {
        rigidBodyRef.current.resetForces(false);
        rigidBodyRef.current.resetTorques(false);
      }
    }
  }, [block.control, rigidBodyRef.current]);

  useFrame((state, delta) => {
    if (
      !rigidBodyRef ||
      !rigidBodyRef.current ||
      !outerGroupRef ||
      !outerGroupRef.current ||
      !innerGroupRef ||
      !innerGroupRef.current
    )
      return null;
    if (block.control) {
      return null;
    }
    const calcProp: calcType = {
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      colliderRef,
      groundRay,
      state,
      delta,
      worldContext,
      controllerContext,
      dispatch,
      matchSizes: getSizesByUrls(worldContext?.urls),
    };
    if (mode.type === "vehicle") vehicleCalculation(calcProp);
    else if (mode.type === "character") characterCalculation(calcProp);
    else if (mode.type === "airplane") airplaneCalculation(calcProp);
    check(calcProp);
  });
}
