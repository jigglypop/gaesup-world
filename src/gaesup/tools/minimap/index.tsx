import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useCallback, useContext, useState } from "react";

import { GaesupWorldContext } from "../../world/context";
import { minimapDefault } from "./default";
import * as style from "./style.css";
import { minimapType } from "./type";

// X 축은 동(+) 서(-) 방향, 즉 경도를 나타낸다.
// Z 축은 남(+) 북(-) 방향, 즉 위도를 나타낸다.

export function MiniMap(props: minimapType) {
  const { minimap, activeState } = useContext(GaesupWorldContext);
  const [scale, setscale] = useState(props.scale || minimapDefault.scale);
  const {
    minimapStyle,
    innerStyle,
    textStyle,
    objectStyle,
    avatarStyle,
    scaleStyle,
    directionStyle,
    plusMinusStyle,
  } = props;

  const upscale = useCallback(() => {
    const max = props.maxScale || minimapDefault.maxScale;
    setscale((scale) => Math.min(max, scale + 0.1));
  }, [setscale, scale]);

  const downscale = useCallback(() => {
    const min = props.minScale || minimapDefault.minScale;
    setscale((scale) => Math.max(min, scale - 0.1));
  }, [setscale, scale]);

  return (
    <div
      className={style.minimap}
      onWheel={(e) => {
        if (props.blockScale) return;
        if (e.deltaY <= 0) upscale();
        else downscale();
      }}
      style={assignInlineVars(minimapStyle)}
    >
      <div
        className={style.minimapOuter}
        style={assignInlineVars(objectStyle)}
      />

      <div
        className={style.minimapInner}
        style={assignInlineVars({
          transform: props.blockRotate
            ? `translate(-50%, -50%) rotate(180deg) `
            : `translate(-50%, -50%) rotate(${
                (activeState.euler.y * 180) / Math.PI + 180
              }deg) `,
          ...innerStyle,
        })}
      >
        <div
          className={style.direction({
            east: true,
          })}
          style={assignInlineVars(directionStyle)}
        >
          E
        </div>
        <div
          className={style.direction({
            west: true,
          })}
          style={assignInlineVars(directionStyle)}
        >
          W
        </div>
        <div
          className={style.direction({
            south: true,
          })}
          style={assignInlineVars(directionStyle)}
        >
          S
        </div>
        <div
          className={style.direction({ north: true })}
          style={assignInlineVars(directionStyle)}
        >
          N
        </div>

        {Object.values(minimap.props).map(({ center, size, text }, key) => {
          const X = (center.x - activeState.position.x) * scale;
          const Z = (center.z - activeState.position.z) * scale;
          return (
            <div
              key={key}
              className={style.minimapObject}
              style={assignInlineVars({
                width: `${size.x * scale}rem`,
                height: `${size.z * scale}rem`,
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translate(${-X}rem, ${-Z}rem)`,
                transformOrigin: "50% 50%",
                ...objectStyle,
              })}
            >
              {text && (
                <div className={style.text} style={assignInlineVars(textStyle)}>
                  {text}
                </div>
              )}
            </div>
          );
        })}

        <div className={style.avatar} style={assignInlineVars(avatarStyle)} />
      </div>

      {!props.blockScaleControl && (
        <div className={style.scale} style={assignInlineVars(scaleStyle)}>
          <div
            className={style.plusMinus}
            style={assignInlineVars(plusMinusStyle)}
            onClick={() => {
              if (props.blockScale) return;
              downscale();
            }}
          >
            +
          </div>
          SCALE 1:{Math.round(100 / scale)}
          <div
            className={style.plusMinus}
            style={assignInlineVars(plusMinusStyle)}
            onClick={() => {
              if (props.blockScale) return;
              upscale();
            }}
          >
            -
          </div>
        </div>
      )}
    </div>
  );
}
