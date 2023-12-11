"use client";

import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useCallback, useContext, useState } from "react";
import { GaesupWorldContext } from "../../stores/context/gaesupworld";
import * as style from "./style.css";

export default function MiniMap() {
  const { minimap, activeState } = useContext(GaesupWorldContext);
  const [ratio, setRatio] = useState(minimap.ratio);
  let lastScroll = 0;

  const upRatio = useCallback(() => {
    if (ratio >= 1) setRatio((prev) => prev - 0.1);
    else setRatio((prev) => prev + 0.1);
  }, [setRatio, ratio]);

  const downRatio = useCallback(() => {
    if (ratio <= 0) setRatio((prev) => prev + 0.1);
    else setRatio((prev) => prev - 0.1);
  }, [setRatio, ratio]);

  return (
    <div
      className={style.minimap}
      style={minimap.minimapStyle || {}}
      onWheel={(e) => {
        if (e.deltaY > 0) downRatio();
        else upRatio();
      }}
    >
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
                    -obj.center.x + activeState.position.x * ratio
                  }rem, ${-obj.center.z + activeState.position.z * ratio}rem)`,
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
