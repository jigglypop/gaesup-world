import { useContext } from "react";

import { GaesupWorldContext } from "../../world/context/index.js";
import { portalType } from "../../world/context/type.js";
import "./style.css";

export function JumpPortal(props: portalType) {
  const { refs } = useContext(GaesupWorldContext);

  return (
    <div
      className="jumpPortal"
      onClick={() => {
        refs.rigidBodyRef?.current?.setTranslation(props.position, true);
      }}
      style={props.jumpPortalStlye}
    >
      {props.text}
    </div>
  );
}
