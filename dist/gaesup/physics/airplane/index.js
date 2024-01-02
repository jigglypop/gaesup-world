import damping from "./damping";
import direction from "./direction";
import gravity from "./gravity";
import impulse from "./impulse";
import innerCalc from "./innerCalc";
export default function airplaneCalculation(calcProp) {
    direction(calcProp);
    impulse(calcProp);
    damping(calcProp);
    gravity(calcProp);
    innerCalc(calcProp);
}
