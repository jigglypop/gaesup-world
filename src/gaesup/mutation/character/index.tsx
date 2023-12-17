import { passiveMutationPropType } from "../type";
import rotation from "./rotation";
import stabilizing from "./stabilizing";
import transition from "./transition";

export default function characterMutation(props: passiveMutationPropType) {
  stabilizing(props);
  rotation(props);
  transition(props);
}
