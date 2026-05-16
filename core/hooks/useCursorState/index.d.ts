/**
 * A hook to manage cursor hover state and update the cursor style.
 * @returns An object containing the hover state and a memoized callback to set it.
 */
export declare const useCursorState: () => {
    isHovered: boolean;
    setHovered: (hover: boolean) => void;
};
