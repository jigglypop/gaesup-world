import damping from "./damping";
import direction from "./direction";
import impulse from "./impulse";
import innerCalc from "./innerCalc";
export default function vehicleCalculation(calcProp) {
    direction(calcProp);
    impulse(calcProp);
    damping(calcProp);
    innerCalc(calcProp);
}
