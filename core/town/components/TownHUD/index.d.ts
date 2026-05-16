import React from 'react';
export type TownHUDProps = {
    position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
    offset?: {
        top?: number;
        left?: number;
        right?: number;
        bottom?: number;
    };
};
export declare function TownHUD({ position, offset }: TownHUDProps): React.JSX.Element;
export default TownHUD;
