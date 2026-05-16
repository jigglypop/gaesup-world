import { IComponent, ComponentContext } from '../types';
export type CharacterAnimationProps = {
    animations: {
        idle: string | string[];
        walk: string | string[];
        run: string | string[];
        jump: {
            start: string;
            loop: string;
            land: string;
        };
        combat?: Record<string, string | string[]>;
        special?: Record<string, string | string[]>;
    };
    defaultAnimation: string;
};
export declare class CharacterAnimationComponent implements IComponent {
    type: string;
    enabled: boolean;
    private props;
    private currentAnimation;
    private animationMixer?;
    private actions;
    constructor(props: CharacterAnimationProps);
    initialize(context: ComponentContext): void;
    private setupAnimations;
    private playAnimation;
    update(context: ComponentContext): void;
    dispose(): void;
}
