import React from 'react';
export type ShopUIProps = {
    open: boolean;
    onClose: () => void;
    title?: string;
};
export declare function ShopUI({ open, onClose, title }: ShopUIProps): React.JSX.Element | null;
export default ShopUI;
