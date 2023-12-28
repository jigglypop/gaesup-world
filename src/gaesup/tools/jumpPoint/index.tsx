import { useContext } from "react";

import { assignInlineVars } from "@vanilla-extract/dynamic";
import { GaesupWorldContext } from "../../world/context/index.js";
import { pointType } from "../../world/context/type.js";
import * as style from "./style.css";

export default function JumpPoint() {
  const { points, refs } = useContext(GaesupWorldContext);

  return (
    <div className={style.jumpPoints}>
      {refs &&
        points.map((obj: pointType, key: number) => {
          return (
            <div
              key={key}
              className={style.jumpPoint}
              onClick={() => {
                refs.rigidBodyRef?.current?.setTranslation(obj.position, true);
              }}
            >
              {obj.text}
            </div>
          );
        })}
    </div>
  );
}

export function JumpPortal(props: pointType) {
  const { refs } = useContext(GaesupWorldContext);

  return (
    <div
      className={style.jumpPoint}
      onClick={() => {
        refs.rigidBodyRef?.current?.setTranslation(props.position, true);
      }}
      style={assignInlineVars(props.jumpPortalStlye)}
    >
      {props.text}
    </div>
  );
}
