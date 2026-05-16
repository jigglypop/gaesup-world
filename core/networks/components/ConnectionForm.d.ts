import React from 'react';
import { MultiplayerConnectionOptions } from '../types';
interface ConnectionFormProps {
    onConnect: (options: MultiplayerConnectionOptions) => void;
    error?: string | null;
    isConnecting?: boolean;
}
export declare function ConnectionForm({ onConnect, error, isConnecting }: ConnectionFormProps): React.JSX.Element;
export {};
