import stabilizing from "../common/stabilizing";
import transition from "../common/transition";
import rotation from "./rotation";
export default function characterMutation(props) {
    stabilizing(props);
    rotation(props);
    transition(props);
}
