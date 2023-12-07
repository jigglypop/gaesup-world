import { calcPropType } from "..";
import accelaration from "./accelaration";
import direction from "./direction";
import impulse from "./impulse";
import jump from "./jump";
import onTheObject from "./onTheObject";
import stabilizing from "./stabilizing";
import turn from "./turn";

export default function characterCalculation(calcProp: calcPropType) {
  direction(calcProp);
  turn(calcProp);
  stabilizing(calcProp);
  jump(calcProp);
  accelaration(calcProp);
  impulse(calcProp);
  onTheObject(calcProp);
}
