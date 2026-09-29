import { MotionControllerProps } from '../../controller/MotionController/types';
import { MotionDebugPanelProps } from '../MotionDebugPanel/types';

export type MotionUIProps = {
  showController?: boolean;
  showDebugPanel?: boolean;
  controllerProps?: MotionControllerProps;
  debugPanelProps?: MotionDebugPanelProps;
};
