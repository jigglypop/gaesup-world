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
import { useControls } from "leva";
export default function debug(props) {
    var debug = props.debug, tag = props.tag, debugMap = props.debugMap;
    if (debug) {
        var resultMap = Object.keys(props.debugProps).reduce(function (map, key) {
            if (key in debugMap) {
                var debugMapItem = debugMap[key];
                if ("max" in debugMapItem) {
                    map[key] = __assign({ value: props.debugProps[key] }, debugMapItem);
                }
                else if ("options" in debugMapItem) {
                    map[key] = __assign({ value: props.debugProps[key] }, debugMapItem);
                }
                else {
                    map[key] = __assign(__assign(__assign({ value: props.debugProps[key] }, debugMapItem.x), debugMapItem.y), debugMapItem.z);
                }
            }
            return map;
        }, {});
        props.debugProps = useControls(tag, __assign({}, resultMap), {
            collapsed: true,
        });
    }
    return props.debugProps;
}
