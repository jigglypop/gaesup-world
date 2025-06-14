'use client';
import { GaesupComponent } from '../GaesupComponent';
import { useMainFrameLoop } from '../../hooks/useUnifiedFrame';
import { useKeyboard } from '../../hooks/useKeyboard';
import { initControllerProps } from '../../utils/initControllerProps';
import { controllerType } from '../types';

function GaesupUnifiedController(controllerProps: controllerType) {
  useMainFrameLoop();
  useKeyboard();

  const props = {
    ...initControllerProps({ refs: {} as any }),
    children: controllerProps.children,
    groupProps: controllerProps.groupProps || {},
    rigidBodyProps: controllerProps.rigidBodyProps || {},
    controllerOptions: controllerProps.controllerOptions || {
      lerp: { cameraTurn: 1, cameraPosition: 1 },
    },
    parts: controllerProps.parts || [],
    onReady: controllerProps.onReady || (() => {}),
    onFrame: controllerProps.onFrame || (() => {}),
    onDestory: controllerProps.onDestory || (() => {}),
    onAnimate: controllerProps.onAnimate || (() => {}),
  };

  return <GaesupComponent props={props} />;
}

export function GaesupController(props: controllerType) {
  return <GaesupUnifiedController {...props} />;
}
