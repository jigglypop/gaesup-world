import { propType } from "@gaesup/type";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { currentAtom } from "../stores/current";
import { optionsAtom } from "../stores/options";

export default function initSetting(prop: propType) {
  const options = useAtomValue(optionsAtom);
  const current = useAtomValue(currentAtom);
  const { rigidBodyRef } = prop;
  useEffect(() => {
    if (options.mode === "airplane") {
      rigidBodyRef.current.setTranslation(current.position.setY(5), false);
    }
  }, [options.mode]);
}
