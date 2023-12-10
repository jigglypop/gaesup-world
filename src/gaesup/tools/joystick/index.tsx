import {
  MouseEvent,
  MouseEventHandler,
  TouchEvent,
  TouchEventHandler,
  useCallback,
  useRef,
  useState,
} from "react";
import { vars } from "../../../styles/theme.css";
import useJoyStick from "../../stores/joystick";
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
  const { joyStickBall, joyStickOrigin, setBall, setOrigin } = useJoyStick();
  const [mouseDown, setMouseDown] = useState(false);
  const [touchDown, setTouchDown] = useState(false);

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
    });
    setBall({
      x: `${X}px`,
      y: `${Y}px`,
      position: "fixed",
      background:
        currentRadius > originRadius / 2
          ? vars.gradient.lightGreen
          : vars.gradient.green,
      boxShadow: "0 0 10px rgba(99,251,215,1)",
    });
  };

  const initialize = () => {
    setOrigin({
      x: 0,
      y: 0,
      angle: Math.PI / 2,
      currentRadius: 0,
      originRadius: 0,
      isIn: true,
      isOn: false,
    });
    setBall({
      x: "50%",
      y: "50%",
      position: "absolute",
      background: "rgba(0, 0, 0, 0.5)",
      boxShadow: "0 0 10px  rgba(0, 0, 0, 0.5)",
    });
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

  const handleTouchEnd = useCallback(() => {
    return initialize();
  }, [touchDown]);
  const handleMouseOut = useCallback(() => {
    return initialize();
  }, [joyStickBall, joyStickOrigin, setBall, setOrigin, mouseDown]);

  return (
    <>
      <div className={style.joyStick}>
        <div
          className={style.joyStickInner}
          ref={outerRef}
          onMouseDown={() => setMouseDown(true)}
          onMouseUp={() => setMouseDown(false)}
          onMouseMove={handleMouseOver}
          onMouseLeave={() => {
            setMouseDown(false);
            handleMouseOut();
          }}
          onTouchStart={() => setTouchDown(true)}
          onTouchEnd={() => {
            setTouchDown(false);
            handleTouchEnd();
          }}
          onTouchMove={handleTouchMove}
          onTouchCancel={handleTouchEnd}
        >
          <div
            className={`${style.joystickBall}`}
            style={{
              position: joyStickBall.position as "fixed" | "absolute",
              background: joyStickBall.background,
              boxShadow: joyStickBall.boxShadow,
              top: joyStickBall.y,
              left: joyStickBall.x,
            }}
          />
        </div>
      </div>
    </>
  );
}
