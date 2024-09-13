export default function stop(prop) {
    const { worldContext: { control, clicker, mode }, } = prop;
    const { keyS } = control;
    if (keyS && mode.controller === "clicker") {
        clicker.isOn = false;
        clicker.isRun = false;
    }
}
