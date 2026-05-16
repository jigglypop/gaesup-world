export type TouchControlsProps = {
    /** Force visibility regardless of pointer detection. */
    forceVisible?: boolean;
    /** Joystick radius in px. */
    radius?: number;
    /** Joystick deadzone (0..1). Below this, no movement is dispatched. */
    deadzone?: number;
    /** Run-threshold (0..1). Above this, the run flag is also set. */
    runThreshold?: number;
    /** Optional action buttons rendered next to the right cluster. */
    actions?: TouchActionButton[];
};
export type TouchActionButton = {
    id: string;
    label: string;
    /** Single key character to dispatch on press / release (eg. 'F', ' '). */
    key?: string;
    onPress?: () => void;
    onRelease?: () => void;
};
/**
 * Mobile / coarse-pointer overlay: virtual joystick on the left, action
 * buttons on the right. The joystick drives the active input backend with
 * `forward/backward/leftward/rightward/shift`, action buttons
 * dispatch synthetic keyboard events so existing key-bound systems pick them up.
 */
export declare function TouchControls({ forceVisible, radius, deadzone, runThreshold, actions, }?: TouchControlsProps): import("react").JSX.Element | null;
export default TouchControls;
