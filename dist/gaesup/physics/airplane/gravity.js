/**
 * This function calculates and sets gravity.
 *
 * @param {calcPropType} prop - An object containing properties necessary for gravity calculation.
 * @param {object} prop.rigidBodyRef - A reference to the physical object where gravity is being set.
 * @param {object} prop.worldContext - An object representing the current state of the game world.
 * @param {number} prop.worldContext.activeState.position.y - The current Y-coordinate position.
 *
 * Gravity is calculated based on altitude and buoyancy. When altitude is less than 10, gravity is calculated as follows:
 * Gravity = ((1 - buoyancy) / (0 - 10)) * current Y-coordinate + buoyancy
 * Otherwise, gravity is set to 0.1.
 */
export default function gravity(prop) {
    var rigidBodyRef = prop.rigidBodyRef, activeState = prop.worldContext.activeState;
    rigidBodyRef.current.setGravityScale(activeState.position.y < 10
        ? ((1 - 0.1) / (0 - 10)) * activeState.position.y + 1
        : 0.1, false);
}
