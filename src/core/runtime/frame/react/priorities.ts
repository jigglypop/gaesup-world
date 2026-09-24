export const FRAME_PRE_PHYSICS_PRIORITY = -100;
/**
 * Slot for physics driven from the R3F frame, between prePhysics and postPhysics.
 * WorldPhysics steps Rapier on the runtime FixedStepClock's own animation loop, not in this slot.
 */
export const PHYSICS_STEP_PRIORITY = -50;
export const FRAME_SCHEDULER_PRIORITY = -1;
