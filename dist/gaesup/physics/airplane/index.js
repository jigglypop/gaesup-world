import currentSetting from "./currentSetting";
import damping from "./damping";
import direction from "./direction";
import gravity from "./gravity";
import impulse from "./impulse";
import turn from "./turn";
export default function airplaneCalculation(calcProp) {
    direction(calcProp);
    turn(calcProp);
    impulse(calcProp);
    damping(calcProp);
    gravity(calcProp);
    currentSetting(calcProp);
}
