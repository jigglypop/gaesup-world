import {
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { vars } from "../../../styles/theme.css";
import { GaesupToolsContext } from "../context";
import useJoyStick from "./default";
import * as style from "./style.css";

export default function JoyStick() {
  const {
    joystick: { joyStickStyle },
  } = useContext(GaesupToolsContext);
  return (
    <div className={style.joyStick} style={joyStickStyle}>
      <JoyBall />
    </div>
  );
}

export function JoyBall() {
  const outerRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);
  const {
    joystick: { joyStickBallStyle, joyStickInnerStyle, joyStickStyle },
  } = useContext(GaesupToolsContext);
  const { joyStickBall, joyStickOrigin, setBall, setOrigin } = useJoyStick();

  const [state, setState] = useState({
    mouseDown: false,
    touchDown: false,
    position: "fixed",
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

  const resize = () => {
    const client = outerRef.current.getBoundingClientRect();
    setScreenSize(() => ({
      top: client.top,
      left: client.left,
      bottom: client.bottom,
      right: client.right,
      width: client.width,
      height: client.height,
    }));
    initBall();
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

  const calcOriginBall = (X: number, Y: number) => {
    const { top, left, bottom, right, width, height } = screenSize;
    if (top > Y || bottom < Y || left > X || right < X) return;
    const normX = (joyStickOrigin.x - X) ** 2;
    const normY = (joyStickOrigin.y - Y) ** 2;
    const currentRadius = Math.sqrt(normX + normY);
    const originRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);

    setOrigin({
      x: left + width / 2,
      y: bottom - height / 2,
      angle: Math.atan2(Y - (bottom - height / 2), X - (left + width / 2)),
      currentRadius,
      originRadius,
      isIn: currentRadius > originRadius / 2,
      isOn: true,
      isCenter: currentRadius < originRadius / 4,
      isUp: top > Y - height / 2,
    });

    setState((state) => ({
      ...state,
      position: "fixed",
      background:
        currentRadius > originRadius / 2
          ? vars.gradient.lightGreen
          : vars.gradient.green,
      boxShadow: "0 0 10px rgba(99,251,215,1)",
    }));
    setBall({
      top: `${Y}px`,
      left: `${X}px`,
    });
  };

  const handleMouseOver: MouseEventHandler = (e) => {
    if (!state.mouseDown) return;
    calcOriginBall(e.pageX, e.pageY);
  };

  const handleTouchMove: TouchEventHandler = (e) => {
    if (!state.touchDown) return;
    e.preventDefault();
    calcOriginBall(e.touches[0].pageX, e.touches[0].pageY);
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
    <div
      className={style.joyStickInner}
      style={{
        position: "fixed",
        ...joyStickInnerStyle,
      }}
      ref={outerRef}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onMouseMove={handleMouseOver}
      onMouseLeave={handleMouseOut}
      onTouchStart={() => setTouchDown(true)}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchCancel={handleTouchEnd}
    >
      <div
        className={`${style.joystickBall}`}
        ref={childRef}
        style={{
          position: state.position as "fixed" | "absolute" | "relative",
          transform: state.transform,
          background: joyStickBallStyle?.background || state.background,
          boxShadow: joyStickBallStyle?.boxShadow || state.boxShadow,
          top: joyStickBall.top,
          left: joyStickBall.left,
          ...joyStickBallStyle,
        }}
      />
    </div>
  );
}

// import {
//   MouseEvent,
//   MouseEventHandler,
//   TouchEvent,
//   TouchEventHandler,
//   useCallback,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import { vars } from "../../../styles/theme.css";
// import { GaesupToolsContext } from "../context";
// import useJoyStick from "./default";
// import * as style from "./style.css";
//
// export default function JoyStick() {
//   return <JoyBall />;
// }
//
// export function JoyBall() {
//   const outerRef = useRef<HTMLDivElement>(null);
//   const childRef = useRef<HTMLDivElement>(null);
//   const {
//     joystick: { joyStickBallStyle, joyStickInnerStyle, joyStickStyle },
//   } = useContext(GaesupToolsContext);
//   const { joyStickBall, joyStickOrigin, setBall, setOrigin } = useJoyStick();
//   const [mouseDown, setMouseDown] = useState(false);
//   const [touchDown, setTouchDown] = useState(false);
//   const [background, setBackground] = useState("rgba(0, 0, 0, 0.5)");
//   const [boxShadow, setBoxShadow] = useState("0 0 10px  rgba(0, 0, 0, 0.5)");
//
//   const calcOriginBall = <T extends MouseEvent | TouchEvent>(
//     e: T,
//     X: number,
//     Y: number
//   ) => {
//     const outer = e.target as HTMLDivElement;
//     const parent = outer.parentElement as HTMLDivElement;
//     console.log(parent.getBoundingClientRect());
//     const { top, left, bottom, right, width, height } =
//       parent.getBoundingClientRect();
//
//     if (top > Y || bottom < Y || left > X || right < X) return;
//     const normX = (joyStickOrigin.x - X) ** 2;
//     const normY = (joyStickOrigin.y - Y) ** 2;
//     const currentRadius = Math.sqrt(normX + normY);
//     const originRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
//     setOrigin({
//       x: left,
//       y: bottom,
//       angle: Math.atan2(Y - (bottom - height / 2), X - (left + width / 2)),
//       currentRadius,
//       originRadius,
//       isIn: currentRadius > originRadius / 2,
//       isOn: true,
//       isCenter: currentRadius < originRadius / 4,
//       isUp: top > Y - height / 2,
//     });
//     setBoxShadow("0 0 10px rgba(99,251,215,1)");
//     setBackground(
//       currentRadius > originRadius / 2
//         ? vars.gradient.lightGreen
//         : vars.gradient.green
//     );
//     setBall({
//       top: `${top}px`,
//       left: `${left}px`,
//     });
//   };
//
//   const initialize = (e) => {
//     const outer = e.target as HTMLDivElement;
//     const parent = outer.parentElement as HTMLDivElement;
//     const { left, bottom, width, height } = parent.getBoundingClientRect();
//     const x = left;
//     const y = bottom;
//
//     setOrigin({
//       x: x,
//       y: y,
//       angle: Math.PI / 2,
//       currentRadius: 0,
//       originRadius: 0,
//       isIn: true,
//       isOn: false,
//       isCenter: true,
//       isUp: true,
//     });
//     initBall();
//   };
//
//   const handleMouseOver: MouseEventHandler = useCallback(
//     (e) => {
//       if (!mouseDown) return;
//       console.log(e.clientX, e.clientY);
//       calcOriginBall<MouseEvent<Element>>(e, e.pageX, e.pageY);
//     },
//     [
//       joyStickBall,
//       joyStickOrigin,
//       setBall,
//       setOrigin,
//       mouseDown,
//       boxShadow,
//       background,
//       setBoxShadow,
//       setBackground,
//     ]
//   );
//
//   const handleTouchMove: TouchEventHandler = useCallback(
//     (e) => {
//       if (!touchDown) return;
//       calcOriginBall<TouchEvent<Element>>(
//         e,
//         e.touches[0].pageX,
//         e.touches[0].pageY
//       );
//     },
//     [touchDown, boxShadow, background, setBoxShadow, setBackground]
//   );
//
//   const handleTouchEnd: TouchEventHandler = useCallback(
//     (e) => {
//       setTouchDown(false);
//       return initialize(e);
//     },
//     [
//       touchDown,
//       setTouchDown,
//       boxShadow,
//       background,
//       setBoxShadow,
//       setBackground,
//     ]
//   );
//   const handleMouseOut: MouseEventHandler = useCallback(
//     (e) => {
//       setMouseDown(false);
//       return initialize(e);
//     },
//     [
//       setBall,
//       setMouseDown,
//       setOrigin,
//       mouseDown,
//       boxShadow,
//       background,
//       setBoxShadow,
//       setBackground,
//     ]
//   );
//
//   const initBall = () => {
//     const { top, left, width, height } = outerRef.current.getClientRects()[0];
//     setBoxShadow("0 0 10px  rgba(0, 0, 0, 0.5)");
//     setBackground("rgba(0, 0, 0, 0.5)");
//     setBall({
//       top: `${top + height / 2}px`,
//       left: `${left + width / 2}px`,
//     });
//   };
//   // window.addEventListener("resize", () => setScreenSize());
//
//   useEffect(() => {
//     initBall();
//   }, []);
//
//   return (
//     <div className={style.joyStick}>
//       <div
//         className={style.joyStickInner}
//         style={joyStickInnerStyle}
//         ref={outerRef}
//         onMouseDown={() => setMouseDown(true)}
//         onMouseUp={() => setMouseDown(false)}
//         onMouseMove={handleMouseOver}
//         onMouseLeave={(e) => handleMouseOut(e)}
//         onTouchStart={() => setTouchDown(true)}
//         onTouchEnd={(e) => handleTouchEnd(e)}
//         onTouchMove={handleTouchMove}
//         onTouchCancel={handleTouchEnd}
//       >
//         <div
//           className={`${style.joystickBall}`}
//           ref={childRef}
//           style={{
//             background: joyStickBallStyle?.background || background,
//             boxShadow: joyStickBallStyle?.boxShadow || boxShadow,
//             top: joyStickBall.top,
//             left: joyStickBall.left,
//             ...joyStickBallStyle,
//           }}
//         />
//       </div>
//     </div>
//   );
// }
