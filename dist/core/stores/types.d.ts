import { UrlsSlice } from './slices/urls';
import { ModeSlice } from './slices/mode';
import { CameraSlice } from '../camera/stores/slices/camera';
import { CameraOptionSlice } from '../camera/stores/slices/cameraOption';
import { SizesSlice } from './slices/sizes';
import { AnimationSlice } from '../animation/stores/slices';
import { MotionSlice } from '../motions/stores/slices';
import { InteractionSlice } from '../interactions/stores/slices';
import { RideableSlice } from './slices/rideable';
import { PerformanceSlice } from './slices/performance';
import { WorldStatesSlice } from '../world/stores/slices/worldStates';
import { ControlSlice } from './slices/control';
import { BlockSlice } from './slices/block';
import { GameStatesType } from '../world/components/Rideable/types';
import { PerformanceMetrics } from './slices/performance';
import { UrlsType } from './slices/urls';
import { ModeType } from './slices/mode';
import { cameraOptionType } from '../camera/stores/slices/cameraOption';
import { SizesType } from './slices/sizes';
import { AnimationType } from '../animation/stores/slices';
import { controlType } from './slices/control';
import { BlockType } from './slices/block';
export type StoreState = UrlsSlice & ControlSlice & ModeSlice & CameraSlice & CameraOptionSlice & SizesSlice & AnimationSlice & MotionSlice & InteractionSlice & RideableSlice & BlockSlice & PerformanceSlice & WorldStatesSlice & {
    updateState: (updates: Partial<StoreState>) => void;
    initialize: (config: Partial<StoreState>) => void;
};
export type StoreAction = {
    type: 'setUrls';
    payload: Partial<UrlsType>;
} | {
    type: 'setMode';
    payload: ModeType;
} | {
    type: 'setCameraOption';
    payload: cameraOptionType;
} | {
    type: 'setSizes';
    payload: SizesType;
} | {
    type: 'setAnimation';
    payload: AnimationType;
} | {
    type: 'setControl';
    payload: Partial<controlType>;
} | {
    type: 'setBlock';
    payload: Partial<BlockType>;
} | {
    type: 'setPerformance';
    payload: PerformanceMetrics;
} | {
    type: 'initialize';
    payload: Partial<StoreState>;
};
export type { GameStatesType };
