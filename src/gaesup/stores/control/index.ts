import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext } from "../context";

export const controlDefault = {
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
};

export function usePushKey() {
  const { control } = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);

  const pushKey = (key: string, value: boolean) => {
    control[key] = value;
    dispatch({
      type: "update",
      payload: {
        control: {
          ...control,
        },
      },
    });
  };

  return {
    pushKey,
  };
}
