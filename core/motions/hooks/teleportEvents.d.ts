import type { MotionsTeleportPayload } from '../plugin';
export type TeleportEventHandler = (payload: MotionsTeleportPayload) => void;
export declare function subscribeLegacyTeleportEvents(handler: TeleportEventHandler): () => void;
