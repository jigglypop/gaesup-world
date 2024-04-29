import damping from "./damping";
import direction from "./direction";
import impulse from "./impulse";
import innerCalc from "./innerCalc";
import landing from "./landing";
export default function vehicleCalculation(calcProp) {
    direction(calcProp);
    impulse(calcProp);
    damping(calcProp);
    landing(calcProp);
    innerCalc(calcProp);
}
