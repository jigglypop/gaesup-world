"use client";

import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useContext } from "react";
import { GaesupWorldContext } from "../../stores/context";
import * as style from "./style.css";

export function MiniMapInner() {
  const { minimap, activeState } = useContext(GaesupWorldContext);
  // const current = useAtomValue(currentAtom);

  return (
    <div className={style.minimap} style={minimap.minimapStyle || {}}>
      <div className={style.minimapOuter} style={minimap.objectStyle || {}} />
      <div className={style.minimapInner} style={minimap.innerStyle || {}}>
        {Object.values(minimap.props).map((obj, key) => {
          return (
            <div
              key={key}
              className={style.minimapObject}
              style={{
                ...assignInlineVars({
                  width: `${obj.size.x}rem`,
                  height: `${obj.size.z}rem`,
                  transform: `translate(${
                    -obj.center.x + activeState.position.x * minimap.ratio
                  }rem, ${
                    -obj.center.z + activeState.position.z * minimap.ratio
                  }rem)`,
                }),
                ...minimap.objectStyle,
              }}
            >
              <div className={style.text} style={minimap.textStyle}>
                {obj.text}
              </div>
            </div>
          );
        })}
        <div className={style.avatar} style={minimap.avatarStyle} />
      </div>
    </div>
  );
}

export default function MiniMap() {
  return <MiniMapInner />;
}
