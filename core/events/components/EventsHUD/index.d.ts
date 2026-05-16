import React from 'react';
export type EventsHUDProps = {
    position?: 'top-left' | 'top-right';
    excludeIds?: string[];
};
export declare function EventsHUD({ position, excludeIds }: EventsHUDProps): React.JSX.Element | null;
export default EventsHUD;
