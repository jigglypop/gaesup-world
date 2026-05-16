import React from 'react';
export type CraftingUIProps = {
    toggleKey?: string;
    title?: string;
    open?: boolean;
    onClose?: () => void;
};
export declare function CraftingUI({ toggleKey, title, open: openProp, onClose }: CraftingUIProps): React.JSX.Element | null;
export default CraftingUI;
