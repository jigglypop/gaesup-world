export const FRAME_PRE_PHYSICS_PRIORITY = -100;
/**
 * Slot for physics driven from the R3F frame, between prePhysics and postPhysics.
 * WorldPhysics advances the runtime FixedStepClock as the last prePhysics entry, which runs in this position.
 */
export const PHYSICS_STEP_PRIORITY = -50;
export const FRAME_SCHEDULER_PRIORITY = -1;
