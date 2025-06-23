import { CameraDebugPanelProps } from '../CameraDebugPanel/types';
import { CameraControllerProps } from '../CameraController/types';
import { CameraPresetsProps } from '../CameraPresets/types';

export interface CameraUIProps {
  debugPanelProps?: Partial<CameraDebugPanelProps>;
  controllerProps?: Partial<CameraControllerProps>;
  presetsProps?: Partial<CameraPresetsProps>;
}
