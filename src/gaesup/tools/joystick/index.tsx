import {
  MouseEvent,
  MouseEventHandler,
  TouchEvent,
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
  return (
    <div className={style.joyStick}>
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
  const [mouseDown, setMouseDown] = useState(false);
  const [touchDown, setTouchDown] = useState(false);
  const [background, setBackground] = useState("rgba(0, 0, 0, 0.5)");
  const [boxShadow, setBoxShadow] = useState("0 0 10px  rgba(0, 0, 0, 0.5)");

  const calcOriginBall = <T extends MouseEvent | TouchEvent>(
    e: T,
    X: number,
    Y: number
  ): T => {
    const outer = e.target as HTMLDivElement;
    const parent = outer.parentElement as HTMLDivElement;
    const { top, left, bottom, right, width, height } =
      parent.getBoundingClientRect();
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
    setBoxShadow("0 0 10px rgba(99,251,215,1)");
    setBackground(
      currentRadius > originRadius / 2
        ? vars.gradient.lightGreen
        : vars.gradient.green
    );
    setBall({
      top: `${Y}px`,
      left: `${X}px`,
    });
  };

  const initialize = (e) => {
    const outer = e.target as HTMLDivElement;
    const parent = outer.parentElement as HTMLDivElement;
    const { left, bottom, width, height } = parent.getBoundingClientRect();
    const x = left + width / 2;
    const y = bottom - height / 2;
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

  const handleMouseOver: MouseEventHandler = useCallback(
    (e) => {
      if (!mouseDown) return;
      calcOriginBall<MouseEvent<Element>>(e, e.pageX, e.pageY);
    },
    [joyStickBall, joyStickOrigin, setBall, setOrigin, mouseDown]
  );

  const handleTouchMove: TouchEventHandler = useCallback(
    (e) => {
      if (!touchDown) return;
      calcOriginBall<TouchEvent<Element>>(
        e,
        e.touches[0].pageX,
        e.touches[0].pageY
      );
    },
    [touchDown]
  );

  const handleTouchEnd: TouchEventHandler = useCallback(
    (e) => {
      setTouchDown(false);
      return initialize(e);
    },
    [touchDown, setTouchDown]
  );
  const handleMouseOut: MouseEventHandler = useCallback(
    (e) => {
      setMouseDown(false);
      return initialize(e);
    },
    [setBall, setMouseDown, setOrigin, mouseDown]
  );

  const initBall = () => {
    if (outerRef.current) {
      const { top, left, width, height } = outerRef.current.getClientRects()[0];
      setBoxShadow("0 0 10px  rgba(0, 0, 0, 0.5)");
      setBackground("rgba(0, 0, 0, 0.5)");
      setBall({
        top: `${top + height / 2}px`,
        left: `${left + width / 2}px`,
      });
    }
  };

  useEffect(() => {
    initBall();
  }, []);

  return (
    <div className={style.joyStick} style={joyStickStyle}>
      <div
        className={style.joyStickInner}
        style={joyStickInnerStyle}
        ref={outerRef}
        onMouseDown={() => setMouseDown(true)}
        onMouseUp={() => setMouseDown(false)}
        onMouseMove={handleMouseOver}
        onMouseLeave={(e) => handleMouseOut(e)}
        onTouchStart={() => setTouchDown(true)}
        onTouchEnd={(e) => handleTouchEnd(e)}
        onTouchMove={handleTouchMove}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className={`${style.joystickBall}`}
          ref={childRef}
          style={{
            background: joyStickBallStyle?.background || background,
            boxShadow: joyStickBallStyle?.boxShadow || boxShadow,
            top: joyStickBall.top,
            left: joyStickBall.left,
            ...joyStickBallStyle,
          }}
        />
      </div>
    </div>
  );
}
