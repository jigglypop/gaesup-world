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
export function gaesupControllerReducer(props, action) {
    switch (action.type) {
        case "init": {
            return __assign({}, props);
        }
        case "update": {
            return __assign(__assign({}, props), action.payload);
        }
    }
}
