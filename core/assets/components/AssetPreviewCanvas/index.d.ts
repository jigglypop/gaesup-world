import type { AssetRecord } from '../../types';
export type AssetPreviewCanvasProps = {
    asset?: AssetRecord;
    size?: number;
    className?: string;
};
export declare function AssetPreviewCanvas({ asset, size, className }: AssetPreviewCanvasProps): import("react").JSX.Element;
