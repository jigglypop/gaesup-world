import transition from "../common/transition";
import { passiveMutationPropType } from "../type";
import rotation from "./rotation";

export default function vehicleMutation(props: passiveMutationPropType) {
  rotation(props);
  transition(props);
}
