import transition from "../common/transition";
import rotation from "./rotation";
export default function vehicleMutation(props) {
    rotation(props);
    transition(props);
}
