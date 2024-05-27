import direction from "./direction";
import impulse from "./impulse";
import innerCalc from "./innerCalc";
import queue from "./queue";
import stop from "./stop";
export default function characterCalculation(calcProp) {
    direction(calcProp);
    impulse(calcProp);
    innerCalc(calcProp);
    stop(calcProp);
    queue(calcProp);
}
