import { calcPropType } from "../type";
import ground from "./ground";
import moving from "./moving";
import push from "./push";
import riding from "./riding";
import rotate from "./rotate";
import slope from "./slope";

export default function check(calcProp: calcPropType) {
  ground(calcProp);
  slope(calcProp);
  moving(calcProp);
  rotate(calcProp);
  push(calcProp);
  riding(calcProp);
}
