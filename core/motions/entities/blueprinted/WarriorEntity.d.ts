export declare class WarriorEntity {
    mass: number;
    moveSpeed: number;
    jumpForce: number;
    health: number;
    strength: number;
    private position;
    private velocity;
    constructor();
    private initializeFromBlueprint;
    move(direction: {
        x: number;
        z: number;
    }): void;
    jump(): void;
    update(deltaTime: number): void;
    getPosition(): {
        x: number;
        y: number;
        z: number;
    };
    getStats(): {
        health: number;
        strength: number;
        mass: number;
        moveSpeed: number;
    };
}
