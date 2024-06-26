import { calcType } from "../type";
import ground from "./ground";
import moving from "./moving";
import push from "./push";
import riding from "./riding";
import rotate from "./rotate";

export default function check(calcProp: calcType) {
  ground(calcProp);
  moving(calcProp);
  rotate(calcProp);
  push(calcProp);
  riding(calcProp);
}
