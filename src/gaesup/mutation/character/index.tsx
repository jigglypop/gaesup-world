import stabilizing from "../common/stabilizing";
import transition from "../common/transition";
import { passiveMutationPropType } from "../type";
import rotation from "./rotation";

export default function characterMutation(props: passiveMutationPropType) {
  stabilizing(props);
  rotation(props);
  transition(props);
}
