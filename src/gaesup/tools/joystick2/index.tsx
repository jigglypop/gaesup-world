import {
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { GaesupWorldContext } from "../../world/context";
import useJoyStick from "./default";
import "./style.css";
import { joyStickType } from "./type";

export function JoyStick(props: joyStickType) {
  const outerRef = useRef<SVGCircleElement>(null);
  const childRef = useRef<SVGCircleElement>(null);
  const { joyStickBallStyle, joyStickStyle } = props;
  const { mode } = useContext(GaesupWorldContext);
  const { joyStickBall, joyStickOrigin, setBall, setOrigin } = useJoyStick();

  const [state, setState] = useState({
    mouseDown: false,
    touchDown: false,
    position: "absolute",
    transform: "",
    background: "rgba(0, 0, 0, 0.5)",
    boxShadow: "0 0 10px  rgba(0, 0, 0, 0.5)",
  });
  const [screenSize, setScreenSize] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  });

  const initBall = () => {
    setState((state) => ({
      ...state,
      position: "absolute",
      transform: "translate(-50%, -50%)",
      background: "rgba(0, 0, 0, 0.5)",
      boxShadow: "0 0 10px  rgba(0, 0, 0, 0.5)",
    }));
    setBall({
      top: "50%",
      left: "50%",
    });
  };

  const setMouseDown = (value: boolean) => {
    setState((state) => ({
      ...state,
      mouseDown: value,
    }));
  };

  const setTouchDown = (value: boolean) => {
    setState((state) => ({
      ...state,
      touchDown: value,
    }));
  };

  const initialize = () => {
    const client = outerRef.current.getBoundingClientRect();
    const x = client.left + client.width / 2;
    const y = client.top + client.height / 2;
    setScreenSize(() => ({
      top: client.top,
      left: client.left,
      bottom: client.bottom,
      right: client.right,
      width: client.width,
      height: client.height,
    }));
    setOrigin({
      x: x,
      y: y,
      angle: Math.PI / 2,
      currentRadius: 0,
      originRadius: 0,
      isIn: true,
      isOn: false,
      isCenter: true,
      isUp: true,
    });
    initBall();
  };

  const resize = () => {
    if (!outerRef.current) return;
    const client = outerRef.current.getBoundingClientRect();
    setScreenSize(() => ({
      top: client.top,
      left: client.left,
      bottom: client.bottom,
      right: client.right,
      width: client.width,
      height: client.height,
    }));
  };

  const calcOriginBall = (X: number, Y: number) => {
    const { top, left, bottom, right, width, height } = screenSize;

    //     if (top > Y || bottom < Y || left > X || right < X) return;
    //     const dx = joyStickOrigin.x - X;
    //     const dy = joyStickOrigin.y - Y;
    //     const normX = dx ** 2;
    //     const normY = dy ** 2;
    //     const currentRadius = Math.sqrt(normX + normY);
    //     const originRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
    //
    //     const newAngle = Math.atan2(
    //       Y - (bottom - height / 2),
    //       X - (left + width / 2)
    //     );
    //
    //     setOrigin({
    //       x: left + width / 2,
    //       y: bottom - height / 2,
    //       angle: newAngle,
    //       currentRadius,
    //       originRadius,
    //       isIn: currentRadius > originRadius / 2,
    //       isOn: true,
    //       isCenter: currentRadius < originRadius / 4,
    //       isUp: top > Y - height / 2,
    //     });
    //
    //     setState((state) => ({
    //       ...state,
    //       position: "fixed",
    //       background:
    //         currentRadius > originRadius / 2
    //           ? "linear-gradient( 68.4deg,  rgba(176,255,237,1) -0.4%, rgba(161,244,255,1) 100.2% )"
    //           : "linear-gradient( 68.4deg,  rgba(99,251,215,1) -0.4%, rgba(5,222,250,1) 100.2% )",
    //       boxShadow: "0 0 10px rgba(99,251,215,1)",
    //     }));
    setBall({
      left: `${X - left}px`,
      top: `${Y - top}px`,
    });
  };

  const handleMouseOver: MouseEventHandler = (e) => {
    if (!state.mouseDown) return;
    e.preventDefault();
    calcOriginBall(e.clientX, e.clientY);
  };

  const handleTouchMove: TouchEventHandler = (e) => {
    if (!state.touchDown) return;
    e.preventDefault();
    calcOriginBall(e.touches[0].screenX, e.touches[0].screenY);
  };

  const handleTouchEnd: TouchEventHandler = useCallback(
    (e) => {
      setState((state) => ({
        ...state,
        touchDown: false,
      }));
      e.preventDefault();
      return initialize();
    },
    [setBall, setState, setOrigin, state.touchDown]
  );
  const handleMouseOut: MouseEventHandler = useCallback(
    (e) => {
      console.log("나감");
      setState((state) => ({
        ...state,
        mouseDown: false,
      }));
      e.preventDefault();
      return initialize();
    },
    [setBall, setState, setOrigin, state.mouseDown]
  );

  useEffect(() => {
    window.addEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (outerRef.current) {
      initialize();
    }
  }, []);

  return (
    <>
      {mode.controller === "joystick" && (
        <div
          className="joyStick"
          style={{
            position: "fixed",
            ...joyStickStyle,
          }}
        >
          <svg>
            <circle
              cx="60"
              cy="60"
              r="60"
              fill="rgba(0, 0, 0, 0.2)"
              ref={outerRef}
              onMouseDown={(e) => {
                e.preventDefault();
                setMouseDown(true);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                setMouseDown(false);
              }}
              onMouseMove={(e) => {
                console.log(e);
                handleMouseOver(e);
              }}
              onMouseLeave={handleMouseOut}
              // onTouchStart={(e) => {
              //   e.preventDefault();
              //   setTouchDown(true);
              // }}
              // onTouchEnd={handleTouchEnd}
              // onTouchMove={handleTouchMove}
              // onTouchCancel={handleTouchEnd}
            ></circle>
            <circle
              cx={joyStickBall.left}
              cy={joyStickBall.top}
              r="30"
              fill="url(#red-yellow)"
              className="joystickBall"
              ref={childRef}
              onMouseDown={(e) => {
                e.preventDefault();
                setMouseDown(true);
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                setMouseDown(false);
              }}
              onMouseMove={(e) => {
                console.log(e);
                handleMouseOver(e);
              }}
              // onMouseDown={(e) => {
              //   e.preventDefault();
              //   setMouseDown(true);
              // }}
              // onMouseUp={(e) => {
              //   e.preventDefault();
              //   setMouseDown(false);
              // }}
              // onMouseMove={handleMouseOver}
              // onMouseLeave={handleMouseOut}
              // onTouchStart={(e) => {
              //   e.preventDefault();
              //   setTouchDown(true);
              // }}
              // onTouchEnd={handleTouchEnd}
              // onTouchMove={handleTouchMove}
              // onTouchCancel={handleTouchEnd}
              // style={{
              //   position: state.position as "fixed" | "absolute" | "relative",
              //   transform: state.transform,
              //   background: joyStickBallStyle?.background || state.background,
              //   boxShadow: joyStickBallStyle?.boxShadow || state.boxShadow,
              //   top: joyStickBall.top,
              //   left: joyStickBall.left,
              //   ...joyStickBallStyle,
              // }}
            >
              {" "}
            </circle>
            <defs>
              <radialGradient
                id="red-yellow"
                cx="50%"
                cy="50%"
                r="50%"
                fx="20%"
                fy="20%"
              >
                <stop offset="0%" stopColor="#ffc054" />
                <stop offset="100%" stopColor="#ff614b" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      )}
    </>
  );
}
