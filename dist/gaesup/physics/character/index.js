import direction from "./direction";
import impulse from "./impulse";
import innerCalc from "./innerCalc";
export default function characterCalculation(calcProp) {
    direction(calcProp);
    impulse(calcProp);
    innerCalc(calcProp);
}
