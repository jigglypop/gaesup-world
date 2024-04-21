var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
export default function landing(prop) {
    var _a = prop.worldContext, states = _a.states, rideable = _a.rideable, mode = _a.mode, dispatch = prop.dispatch;
    var isLanding = states.isLanding;
    if (isLanding) {
        states.isLanding = false;
        states.enableRiding = false;
    }
    dispatch({
        type: "update",
        payload: {
            mode: __assign({}, mode),
            rideable: __assign({}, rideable),
        },
    });
}
