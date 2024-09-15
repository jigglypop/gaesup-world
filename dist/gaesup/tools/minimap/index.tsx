import { useCallback, useContext, useState } from "react";
import { GaesupWorldContext } from "../../world/context";
import * as S from "./style.css";

// X 축은 동(+) 서(-) 방향, 즉 경도를 나타낸다.
// Z 축은 남(+) 북(-) 방향, 즉 위도를 나타낸다.

export const minimapDefault = {
  scale: 0.5,
  minScale: 0.1,
  maxScale: 2,
  blockScale: false,
};

export const minimapInnerDefault = {
  props: {},
};

export function MiniMap(props: any) {
  const { minimap, activeState, mode } = useContext(GaesupWorldContext);
  const [scale, setscale] = useState(props.scale || minimapDefault.scale);
  const {
    minimapInnerStyle,
    textStyle,
    minimapObjectStyle,
    avatarStyle,
    scaleStyle,
    directionStyle,
    plusMinusStyle,
    imageStyle,
    minimapStyle,
    minimapOuterStyle,
  } = props;

  const upscale = useCallback(() => {
    const max = props.maxScale || minimapDefault.maxScale;
    setscale((scale) => Math.min(max, scale + 0.1));
  }, [props.maxScale]);

  const downscale = useCallback(() => {
    const min = props.minScale || minimapDefault.minScale;
    setscale((scale) => Math.max(min, scale - 0.1));
  }, [props.minScale]);

  return (
    <div
      className={S.minimap}
      onWheel={(e) => {
        if (props.blockScale) return;
        if (e.deltaY <= 0) upscale();
        else downscale();
      }}
      style={minimapStyle}
    >
      <div className={S.minimapOuter} style={minimapOuterStyle} />

      <div
        className={S.minimapInner}
        style={{
          transform:
            props.blockRotate || mode.control === "normal"
              ? `translate(-50%, -50%) rotate(180deg)`
              : `translate(-50%, -50%) rotate(${
                  (activeState.euler.y * 180) / Math.PI + 180
                }deg)`,
          ...minimapInnerStyle,
        }}
      >
        <div
          className={S.east}
          style={{
            transform:
              props.blockRotate || mode.control === "normal"
                ? `translate(-50%, -50%) rotate(180deg)`
                : `translate(-50%, -50%) rotate(-${
                    (activeState.euler.y * 180) / Math.PI + 180
                  }deg)`,
            ...directionStyle,
          }}
        >
          E
        </div>
        <div
          className={S.west}
          style={{
            transform:
              props.blockRotate || mode.control === "normal"
                ? `translate(50%, -50%) rotate(180deg)`
                : `translate(50%, -50%) rotate(-${
                    (activeState.euler.y * 180) / Math.PI + 180
                  }deg)`,
            ...directionStyle,
          }}
        >
          W
        </div>
        <div
          className={S.south}
          style={{
            transform:
              props.blockRotate || mode.control === "normal"
                ? `translate(-50%, 50%) rotate(180deg)`
                : `translate(-50%, 50%) rotate(-${
                    (activeState.euler.y * 180) / Math.PI + 180
                  }deg)`,
            ...directionStyle,
          }}
        >
          S
        </div>
        <div
          className={S.north}
          style={{
            transform:
              props.blockRotate || mode.control === "normal"
                ? `translate(-50%, -50%) rotate(180deg)`
                : `translate(-50%, -50%) rotate(-${
                    (activeState.euler.y * 180) / Math.PI + 180
                  }deg)`,
            ...directionStyle,
          }}
        >
          N
        </div>
        {Object.values(minimap.props).map(({ center, size, text }, key) => {
          const X =
            (center.x - activeState.position.x) *
            (props.angle ? Math.sin(props.angle) : 1) *
            scale;
          const Z =
            (center.z - activeState.position.z) *
            (props.angle ? -Math.cos(props.angle) : 1) *
            scale;
          return (
            <div key={key}>
              <div
                className={S.minimapObject}
                style={{
                  width: `${size.x * scale}rem`,
                  height: `${size.z * scale}rem`,
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem) rotate(${
                    (Math.PI * 3) / 2 + props.angle || 0
                  }rad)`,
                  transformOrigin: "50% 50%",
                  zIndex: 1 + key,
                  ...minimapObjectStyle,
                }}
              ></div>
              {key === 0 && (
                <div
                  className={S.imageObject}
                  style={{
                    width: `${size.x * scale}rem`,
                    height: `${size.z * scale}rem`,
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem) rotate(${
                      (Math.PI * 3) / 2 + props.angle || 0
                    }rad)`,
                    transformOrigin: "50% 50%",
                    zIndex: 10 + key,
                    ...imageStyle,
                  }}
                ></div>
              )}
              <div
                className={S.textObject}
                style={{
                  width: `${size.x * scale}rem`,
                  height: `${size.z * scale}rem`,
                  top: "50.1%",
                  left: "50.1%",
                  transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem)`,
                  transformOrigin: "50.1% 50.1%",
                  zIndex: 1001 + key,
                }}
              >
                {text && (
                  <div
                    className={S.text}
                    style={{
                      ...textStyle,
                      zIndex: 1001 + key,
                      transform:
                        props.blockRotate || mode.control === "normal"
                          ? `rotate(180deg)`
                          : `rotate(-${
                              (activeState.euler.y * 180) / Math.PI + 180
                            }deg)`,
                    }}
                  >
                    {text}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div className={S.avatar} style={avatarStyle} />
      </div>

      {!props.blockScaleControl && (
        <div className={S.scale} style={scaleStyle}>
          <div
            className={S.plusMinus}
            style={plusMinusStyle}
            onClick={() => {
              if (props.blockScale) return;
              downscale();
            }}
          >
            +
          </div>
          SCALE 1:{Math.round(100 / scale)}
          <div
            className={S.plusMinus}
            style={plusMinusStyle}
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
