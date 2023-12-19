export default function transition(props) {
    var rigidBodyRef = props.rigidBodyRef, position = props.position;
    rigidBodyRef.current.setTranslation(position, false);
}
