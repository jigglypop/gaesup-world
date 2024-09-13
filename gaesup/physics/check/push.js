export default function push(prop) {
    const { worldContext: { states, control }, } = prop;
    Object.keys(control).forEach((key) => {
        states.isPush[key] = control[key];
    });
}
