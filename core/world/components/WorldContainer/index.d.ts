import { ReactNode } from 'react';
import { WorldContainerProps } from './types';
export type { WorldAssetUrls, WorldCameraOption, WorldContainerProps } from './types';
/**
 * Applies world-related configuration into the shared stores and renders children unchanged.
 * Prefer this name for new code; `WorldContainer` remains as a backward-compatible alias.
 */
export declare function WorldConfigProvider(props: WorldContainerProps): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | import("react").ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react").JSX.Element | null | undefined;
/**
 * @deprecated Use `WorldConfigProvider` for clearer semantics.
 */
export declare const WorldContainer: typeof WorldConfigProvider;
export declare function GaesupWorldContent({ children, showGrid, showAxes }: {
    children?: ReactNode;
    showGrid?: boolean;
    showAxes?: boolean;
}): import("react").JSX.Element;
export default WorldContainer;
