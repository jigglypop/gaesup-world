import { useEffect } from "react";
import { update } from "../../utils/context";
import debug from "../../utils/debug";
import { cameraOptionType, gaesupWorldContextType } from "../context/type";
import { innerDebugPropType } from "../initalize/type";
import { cameraOptionDebugMap } from "./cameraOption";

export default function initDebug({ value, dispatch }: innerDebugPropType) {
  const { debug: worldDebug } = value;
  if (!worldDebug) return;
  const cameraOptionValue = debug<cameraOptionType>({
    debug: worldDebug,
    debugProps: value.cameraOption,
    tag: "cameraOption",
    debugMap: cameraOptionDebugMap,
  });

  useEffect(() => {
    update<gaesupWorldContextType>(
      {
        cameraOption: {
          ...cameraOptionValue,
        },
      },
      dispatch
    );
  }, [cameraOptionValue]);
}
