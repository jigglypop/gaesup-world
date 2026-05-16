export type OutfitAvatarProps = {
    /**
     * Vertical offset from the player's RigidBody origin to the top of the head.
     * Tuned for the default character glb (~1.7m tall).
     */
    headHeight?: number;
    /** When false, the overlay simply does not render. */
    enabled?: boolean;
    /** Optional opacity to tone the overlay down (e.g. for first person). */
    opacity?: number;
};
export declare function OutfitAvatar({ headHeight, enabled, opacity, }?: OutfitAvatarProps): import("react").JSX.Element | null;
