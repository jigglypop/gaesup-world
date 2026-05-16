import React from 'react';
export { notify, useToastStore } from './toastStore';
export type { Toast, ToastKind } from './toastStore';
export type ToastHostProps = {
    position?: 'top-right' | 'top-center';
    max?: number;
};
export declare function ToastHost({ position, max }: ToastHostProps): React.JSX.Element;
export default ToastHost;
