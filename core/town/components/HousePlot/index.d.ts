import React from 'react';
export type HousePlotProps = {
    id: string;
    position: [number, number, number];
    size?: [number, number];
    emptyColor?: string;
    reservedColor?: string;
    occupiedColor?: string;
};
export declare function HousePlot({ id, position, size, emptyColor, reservedColor, occupiedColor, }: HousePlotProps): React.JSX.Element;
export default HousePlot;
