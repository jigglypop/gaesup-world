import { ReactNode } from 'react';
import { GaesupControllerProps } from '@hooks/useGaesupController/types';
import type { ClickerMoveOptions } from '../../../hooks/useClicker/types';
type ControllerWrapperProps = GaesupControllerProps & {
    children?: ReactNode;
    clickerOptions?: ClickerMoveOptions;
};
export declare function ControllerWrapper(props: ControllerWrapperProps): import("react").JSX.Element;
export * from './types';
export { ControllerWrapper as GaesupController };
