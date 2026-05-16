import React from 'react';
export type CropPlotProps = {
    id: string;
    position: [number, number, number];
    size?: number;
    hitRange?: number;
};
export declare function CropPlot({ id, position, size, hitRange }: CropPlotProps): React.JSX.Element;
export default CropPlot;
