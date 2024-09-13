export default function landing(prop) {
    const { worldContext: { states, rideable, mode }, dispatch, } = prop;
    const { isRiding } = states;
    if (isRiding) {
        rideable.objectType = null;
        rideable.key = null;
        mode.type = "character";
        states.isRiding = false;
        states.enableRiding = false;
    }
    dispatch({
        type: "update",
        payload: {
            mode: Object.assign({}, mode),
            rideable: Object.assign({}, rideable),
        },
    });
}
