import React from 'react';
type FieldRowProps = {
    label: string;
    children: React.ReactNode;
};
export declare function FieldRow({ label, children }: FieldRowProps): React.JSX.Element;
type FieldToggleProps = {
    value: boolean;
    onChange: (value: boolean) => void;
};
export declare function FieldToggle({ value, onChange }: FieldToggleProps): React.JSX.Element;
type FieldColorProps = {
    value: string;
    onChange: (value: string) => void;
};
export declare function FieldColor({ value, onChange }: FieldColorProps): React.JSX.Element;
export {};
