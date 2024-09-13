import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function usePushKey() {
    const { control } = useContext(GaesupWorldContext);
    const dispatch = useContext(GaesupWorldDispatchContext);
    const pushKey = (key, value) => {
        control[key] = value;
        dispatch({
            type: "update",
            payload: {
                control: Object.assign({}, control),
            },
        });
    };
    return {
        pushKey,
    };
}
