import React from 'react';
export type AudioControlsProps = {
    position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
    offset?: {
        top?: number;
        left?: number;
        right?: number;
        bottom?: number;
    };
};
export declare function AudioControls({ position, offset }: AudioControlsProps): React.JSX.Element;
export default AudioControls;
