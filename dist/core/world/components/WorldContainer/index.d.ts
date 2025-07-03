import { ReactNode } from 'react';
import { WorldContainerProps } from './types';
export declare function WorldContainer(props: WorldContainerProps): ReactNode;
export declare function GaesupWorldContent({ children, showGrid, showAxes }: {
    children?: ReactNode;
    showGrid?: boolean;
    showAxes?: boolean;
}): import("react").JSX.Element;
export default WorldContainer;
