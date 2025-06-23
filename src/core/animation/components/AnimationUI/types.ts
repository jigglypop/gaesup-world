import { AnimationControllerProps } from '../AnimationController/types';
import { AnimationPlayerProps } from '../AnimationPlayer/types';
import { AnimationDebugPanelProps } from '../AnimationDebugPanel/types';

export interface AnimationUIProps {
  showController?: boolean;
  showPlayer?: boolean;
  showDebugPanel?: boolean;
  controllerProps?: Partial<AnimationControllerProps>;
  playerProps?: Partial<AnimationPlayerProps>;
  debugPanelProps?: Partial<AnimationDebugPanelProps>;
}
