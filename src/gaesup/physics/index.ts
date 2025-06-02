import { useContext, useEffect, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { GaesupControllerContext } from '../controller/context';
import { useGaesupGltf } from '../hooks/useGaesupGltf';
import { useUnifiedFrame } from '../hooks/useUnifiedFrame';
import { usePhysicsInput } from '../hooks/usePhysicsInput';
import { keyboardInputAtom, mouseInputAtom } from '../atoms/inputSystemAtom';
import { V3 } from '../utils';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../world/context';
import { urlsAtom, blockAtom } from '../atoms';
import airplaneCalculation from './airplane';
import characterCalculation from './character';
import check from './check';
import { calcType } from './type';
import vehicleCalculation from './vehicle';

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
  const { inputRef } = usePhysicsInput();
  const setKeyboardInput = useSetAtom(keyboardInputAtom);
  const setMouseInput = useSetAtom(mouseInputAtom);
  const urls = useAtomValue(urlsAtom);
  const block = useAtomValue(blockAtom);
  const { mode, activeState } = worldContext;
  const { getSizesByUrls } = useGaesupGltf();
  useEffect(() => {
    if (!rigidBodyRef || !innerGroupRef) return;
    if (rigidBodyRef.current && innerGroupRef.current) {
      rigidBodyRef.current.lockRotations(false, true);
      activeState.euler.set(0, 0, 0);
      rigidBodyRef.current.setTranslation(activeState.position.clone().add(V3(0, 5, 0)), true);
    }
  }, [mode.type, rigidBodyRef, innerGroupRef, activeState]);

  useEffect(() => {
    if (rigidBodyRef?.current && block.control) {
      rigidBodyRef.current.resetForces(false);
      rigidBodyRef.current.resetTorques(false);
    }
  }, [block.control]);

  const isReady = useMemo(() => 
    rigidBodyRef?.current && 
    outerGroupRef?.current && 
    innerGroupRef?.current, 
    [rigidBodyRef?.current, outerGroupRef?.current, innerGroupRef?.current]
  );

  const matchSizes = useMemo(() => 
    getSizesByUrls(urls), 
    [getSizesByUrls, urls]
  );

  const calculationFunction = useMemo(() => {
    switch (mode.type) {
      case 'vehicle': return vehicleCalculation;
      case 'character': return characterCalculation;
      case 'airplane': return airplaneCalculation;
      default: return characterCalculation;
    }
  }, [mode.type]);

  useUnifiedFrame(
    `physics-${rigidBodyRef?.current?.handle || 'unknown'}`,
    (state, delta) => {
      if (!isReady || block.control) {
        return;
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
        matchSizes,
        inputRef,
        setKeyboardInput,
        setMouseInput,
      };
      calculationFunction(calcProp);
      check(calcProp);
    },
    0, // 최고 우선순위
    isReady && !block.control
  );
}
