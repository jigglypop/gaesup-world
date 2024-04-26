import { useEffect, useRef } from "react";
export var useForwardRef = function (ref, initialValue) {
    if (initialValue === void 0) { initialValue = null; }
    var targetRef = useRef(initialValue);
    useEffect(function () {
        if (!ref)
            return;
        if (typeof ref === "function") {
            ref(targetRef.current);
        }
        else {
            targetRef.current = ref.current;
        }
    }, [ref]);
    return targetRef;
};
