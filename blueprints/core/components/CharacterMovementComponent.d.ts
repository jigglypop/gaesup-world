import { IComponent, ComponentContext } from '../types';
export type CharacterMovementProps = {
    walkSpeed: number;
    runSpeed: number;
    jumpHeight: number;
    airControl: number;
};
export declare class CharacterMovementComponent implements IComponent {
    type: string;
    enabled: boolean;
    private props;
    private velocity;
    private isGrounded;
    constructor(props: CharacterMovementProps);
    initialize(context: ComponentContext): void;
    update(context: ComponentContext): void;
    dispose(): void;
}
