import React from 'react';
import { type GameplayEventBlueprint, type GameplayTriggerEvent } from '../../../../gameplay';
import type { EditorPanelBaseProps } from '../types';
import './styles.css';
export type GameplayEventPanelProps = EditorPanelBaseProps & {
    blueprints?: GameplayEventBlueprint[];
    onCreate?: (blueprint: GameplayEventBlueprint) => void;
    onUpdate?: (blueprint: GameplayEventBlueprint) => void;
    onDelete?: (id: string) => void;
    onRun?: (trigger: GameplayTriggerEvent) => void | Promise<void>;
};
export declare function GameplayEventPanel({ blueprints, onCreate, onUpdate, onDelete, onRun, className, style, children, }: GameplayEventPanelProps): React.JSX.Element;
