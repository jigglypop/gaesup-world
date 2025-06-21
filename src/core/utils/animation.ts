import { useEffect, useMemo, useRef } from 'react';
import { useGaesupStore } from '../stores/gaesupStore';


// export function useAnimationPlayer(actions: AnimationActions | undefined, active: boolean) {
//   const states = useGaesupStore((state) => state.states);
//   const input = useGaesupStore((state) => state.input);
// 
//   const movement = useMemo(() => {
//     const isKeyboardMoving =
//       input.keyboard.forward ||
//       input.keyboard.backward ||
//       input.keyboard.leftward ||
//       input.keyboard.rightward;
//     const isPointerMoving = input.pointer.isActive;
//     return {
//       isMoving: isKeyboardMoving || isPointerMoving,
//       isRunning:
//         (input.keyboard.shift && isKeyboardMoving) ||
//         (input.pointer.shouldRun && isPointerMoving && input.clickerOption.isRun),
//     };
//   }, [input]);
// 
//   const activeTag = (() => {
//     if (states.isJumping) return 'jump';
//     if (states.isFalling) return 'fall';
//     if (states.isRiding) return 'ride';
//     if (states.isLanding) return 'land';
//     if (movement.isRunning) return 'run';
//     if (movement.isMoving) return 'walk';
//     return 'idle';
//   })();
//   const previousTag = useRef('idle');
// 
//   useEffect(() => {
//     if (!active || !actions || activeTag === previousTag.current) return;
//     const currentAction = actions[activeTag];
//     const previousAction = actions[previousTag.current];
//     if (previousAction && previousAction !== null) {
//       previousAction.fadeOut(0.2);
//     }
//     if (currentAction && currentAction !== null) {
//       currentAction.reset().fadeIn(0.2).play();
//     }
//     previousTag.current = activeTag;
//   }, [activeTag, actions, active]);
// }
