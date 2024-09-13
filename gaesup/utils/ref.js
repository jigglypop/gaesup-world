import { useEffect, useRef } from "react";
export const useForwardRef = (ref, initialValue = null) => {
    const targetRef = useRef(initialValue);
    useEffect(() => {
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
