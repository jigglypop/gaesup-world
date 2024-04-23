import { useCallback, useContext, useState } from "react";

import { GaesupWorldContext } from "../../world/context";
import { minimapDefault } from "./default";
import "./style.css";
import { minimapType } from "./type";

// X 축은 동(+) 서(-) 방향, 즉 경도를 나타낸다.
// Z 축은 남(+) 북(-) 방향, 즉 위도를 나타낸다.

export function MiniMap(props: minimapType) {
  const { minimap, activeState, mode } = useContext(GaesupWorldContext);
  const [scale, setscale] = useState(props.scale || minimapDefault.scale);
  const {
    innerStyle,
    textStyle,
    objectStyle,
    avatarStyle,
    scaleStyle,
    directionStyle,
    plusMinusStyle,
    imageStyle,
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
      className="minimap"
      onWheel={(e) => {
        if (props.blockScale) return;
        if (e.deltaY <= 0) upscale();
        else downscale();
      }}
    >
      <div className="minimapOuter" style={objectStyle} />

      <div
        className="minimapInner"
        style={{
          transform:
            props.blockRotate || mode.control === "normal"
              ? `translate(-50%, -50%) rotate(180deg) `
              : `translate(-50%, -50%) rotate(${
                  (activeState.euler.y * 180) / Math.PI + 180
                }deg) `,
          ...innerStyle,
        }}
      >
        {" "}
        <div
          className="east direction"
          style={{
            transform:
              props.blockRotate || mode.control === "normal"
                ? `translate(-50%, -50%) rotate(180deg) `
                : `translate(-50%, -50%) rotate(-${
                    (activeState.euler.y * 180) / Math.PI + 180
                  }deg) `,
            ...directionStyle,
          }}
        >
          E
        </div>
        <div
          className="west direction"
          style={{
            transform:
              props.blockRotate || mode.control === "normal"
                ? `translate(50%, -50%) rotate(180deg) `
                : `translate(50%, -50%) rotate(-${
                    (activeState.euler.y * 180) / Math.PI + 180
                  }deg) `,
            ...directionStyle,
          }}
        >
          W
        </div>
        <div
          className="south direction"
          style={{
            transform:
              props.blockRotate || mode.control === "normal"
                ? `translate(-50%, 50%) rotate(180deg) `
                : `translate(-50%, 50%) rotate(-${
                    (activeState.euler.y * 180) / Math.PI + 180
                  }deg) `,
            ...directionStyle,
          }}
        >
          S
        </div>
        <div
          className="north direction"
          style={{
            transform:
              props.blockRotate || mode.control === "normal"
                ? `translate(-50%, -50%) rotate(180deg) `
                : `translate(-50%, -50%) rotate(-${
                    (activeState.euler.y * 180) / Math.PI + 180
                  }deg) `,
            ...directionStyle,
          }}
        >
          N
        </div>
        ç
        {Object.values(minimap.props).map(({ center, size, text }, key) => {
          const X =
            (center.x - activeState.position.x) *
            (props.angle ? -Math.sin(props.angle) : 1) *
            scale;
          const Z =
            (center.z - activeState.position.z) *
            (props.angle ? Math.cos(props.angle) : 1) *
            scale;
          return (
            <div key={key}>
              <div
                key={key}
                className="minimapObject"
                style={{
                  width: `${size.x * scale}rem`,
                  height: `${size.z * scale}rem`,
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem)`,
                  transformOrigin: "50% 50%",
                  zIndex: 1 + key,
                  ...objectStyle,
                }}
              ></div>
              <div
                key={key + 10}
                className="imageObject"
                style={{
                  width: `${props.imageWidth * scale}rem`,
                  height: `${props.imageHeight * scale}rem`,
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50.1%, -50.1%) translate(${-X}rem, ${-Z}rem)`,
                  transformOrigin: "50% 50%",
                  zIndex: 1000 + key,
                  ...imageStyle,
                }}
              ></div>
              <div
                className="textObject"
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
                    className="text"
                    style={{
                      ...textStyle,
                      zIndex: 1001 + key,
                      transform:
                        props.blockRotate || mode.control === "normal"
                          ? ` rotate(180deg) `
                          : ` rotate(-${
                              (activeState.euler.y * 180) / Math.PI + 180
                            }deg) `,
                    }}
                  >
                    {text}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div className="avatar" style={avatarStyle} />
      </div>

      {!props.blockScaleControl && (
        <div className="scale" style={scaleStyle}>
          <div
            className="plusMinus"
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
            className="plusMinus"
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
