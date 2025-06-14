import { GaesupComponent } from '../GaesupComponent';
import { useMainFrameLoop } from '../../hooks/useUnifiedFrame';
import { useKeyboard } from '../../hooks/useKeyboard';
import { initControllerProps } from '../../utils/initControllerProps';
import { controllerType } from '../types';

export function GaesupController(props: controllerType) {
  useMainFrameLoop();
  useKeyboard();

  const controllerProps = {
    ...initControllerProps({ refs: {} as any }),
    children: props.children,
    groupProps: props.groupProps || {},
    rigidBodyProps: props.rigidBodyProps || {},
    controllerOptions: props.controllerOptions || {
      lerp: { cameraTurn: 1, cameraPosition: 1 },
    },
    parts: props.parts || [],
    onReady: props.onReady || (() => {}),
    onFrame: props.onFrame || (() => {}),
    onDestory: props.onDestory || (() => {}),
    onAnimate: props.onAnimate || (() => {}),
  };

  return <GaesupComponent props={controllerProps} />;
}
