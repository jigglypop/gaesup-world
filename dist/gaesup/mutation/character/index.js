import rotation from "./rotation";
import stabilizing from "./stabilizing";
import transition from "./transition";
export default function characterMutation(props) {
    stabilizing(props);
    rotation(props);
    transition(props);
}
