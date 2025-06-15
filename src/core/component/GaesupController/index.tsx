import { GaesupComponent } from '../GaesupComponent';
import { useMainFrameLoop } from '@hooks/useUnifiedFrame';
import { useKeyboard } from '@hooks/useKeyboard';
import { initControllerProps } from '@utils/initControllerProps';
import { controllerType } from '../types';
import { useGaesupStore } from '@stores/gaesupStore';
import { useEffect } from 'react';

export function GaesupController(props: controllerType) {
  useMainFrameLoop();
  useKeyboard();

  const setControllerOptions = useGaesupStore((state) => state.setControllerOptions);

  useEffect(() => {
    if (props.controllerOptions) {
      setControllerOptions(props.controllerOptions);
    }
  }, [props.controllerOptions, setControllerOptions]);

  const controllerProps = {
    ...initControllerProps({ refs: {} as any }),
    children: props.children,
    groupProps: props.groupProps || {},
    rigidBodyProps: props.rigidBodyProps || {},
    controllerOptions: props.controllerOptions,
    parts: props.parts || [],
    onReady: props.onReady || (() => {}),
    onFrame: props.onFrame || (() => {}),
    onDestory: props.onDestory || (() => {}),
    onAnimate: props.onAnimate || (() => {}),
  };

  return <GaesupComponent props={controllerProps} />;
}
