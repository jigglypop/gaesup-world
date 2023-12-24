import transition from "../common/transition";
import rotation from "./rotation";
export default function airplaneMutation(props) {
    rotation(props);
    transition(props);
}
