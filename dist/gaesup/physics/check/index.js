import ground from "./ground";
import moving from "./moving";
import rotate from "./rotate";
import slope from "./slope";
export default function check(calcProp) {
    ground(calcProp);
    slope(calcProp);
    moving(calcProp);
    rotate(calcProp);
}
