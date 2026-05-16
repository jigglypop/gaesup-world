import React from 'react';
import type { RuntimeRecord } from '@core/boilerplate/types';
import { type InteractableKind } from '../../stores/interactablesStore';
export type InteractableProps = {
    id?: string;
    kind?: InteractableKind;
    label: string;
    range?: number;
    activationKey?: string;
    data?: RuntimeRecord;
    onActivate: () => void;
    position: [number, number, number];
    children?: React.ReactNode;
};
export declare function Interactable({ id, kind, label, range, activationKey, data, onActivate, position, children, }: InteractableProps): React.JSX.Element;
export default Interactable;
