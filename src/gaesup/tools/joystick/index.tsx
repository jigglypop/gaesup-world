import useJoyStick from '@gaesup/stores/joystick';
import { vars } from '@styles/theme.css';
import {
  MouseEventHandler,
  TouchEventHandler,
  useCallback,
  useRef,
  useState
} from 'react';
import GamePad from '../gamepad';
import * as style from './style.css';

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

  const handleMouseOver: MouseEventHandler = useCallback(
    (e) => {
      if (!mouseDown) return;
      const outer = e.target as HTMLDivElement;
      const parent = outer.parentElement as HTMLDivElement;
      const { top, left, bottom, right, width, height } =
        parent.getBoundingClientRect();
      if (
        top > e.clientY ||
        bottom < e.pageY ||
        left > e.pageX ||
        right < e.pageX
      )
        return;
      const normX = (joyStickOrigin.x - e.pageX) ** 2;
      const normY = (joyStickOrigin.y - e.pageY) ** 2;
      const currentRadius = Math.sqrt(normX + normY);
      const originRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);

      setOrigin({
        x: left + width / 2,
        y: bottom - height / 2,
        angle: Math.atan2(
          e.pageY - (bottom - height / 2),
          e.pageX - (left + width / 2)
        ),
        currentRadius,
        originRadius,
        isIn: currentRadius > originRadius / 2,
        isOn: true
      });
      setBall({
        x: `${e.pageX}px`,
        y: `${e.pageY}px`,
        position: 'fixed',
        background:
          currentRadius > originRadius / 2
            ? vars.gradient.lightGreen
            : vars.gradient.green,
        boxShadow: '0 0 10px rgba(99,251,215,1)'
      });
    },
    [joyStickBall, joyStickOrigin, setBall, setOrigin, mouseDown]
  );
  const handleMouseOut = useCallback(() => {
    setOrigin({
      x: 0,
      y: 0,
      angle: Math.PI / 2,
      currentRadius: 0,
      originRadius: 0,
      isIn: true,
      isOn: false
    });
    setBall({
      x: '50%',
      y: '50%',
      position: 'absolute',
      background: 'rgba(0, 0, 0, 0.5)',
      boxShadow: '0 0 10px  rgba(0, 0, 0, 0.5)'
    });
  }, [joyStickBall, joyStickOrigin, setBall, setOrigin, mouseDown]);

  const handleTouchMove: TouchEventHandler = useCallback(
    (e) => {
      if (!touchDown) return;
      const outer = e.target as HTMLDivElement;
      const parent = outer.parentElement as HTMLDivElement;
      const { top, left, bottom, right, width, height } =
        parent.getBoundingClientRect();
      if (
        top > e.touches[0].pageY ||
        bottom < e.touches[0].pageY ||
        left > e.touches[0].pageX ||
        right < e.touches[0].pageX
      )
        return;

      const normX = (joyStickOrigin.x - e.touches[0].pageX) ** 2;
      const normY = (joyStickOrigin.y - e.touches[0].pageY) ** 2;
      const currentRadius = Math.sqrt(normX + normY);
      const originRadius = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
      setOrigin({
        x: left + width / 2,
        y: bottom - height / 2,
        angle: Math.atan2(
          e.touches[0].pageY - (bottom - height / 2),
          e.touches[0].pageX - (left + width / 2)
        ),
        currentRadius,
        originRadius,
        isIn: currentRadius > originRadius / 2,
        isOn: true
      });
      setBall({
        x: `${e.touches[0].pageX}px`,
        y: `${e.touches[0].pageY}px`,
        position: 'fixed',
        background:
          currentRadius > originRadius / 2
            ? vars.gradient.lightGreen
            : vars.gradient.green,
        boxShadow: '0 0 10px rgba(99,251,215,1)'
      });
    },
    [touchDown]
  );

  const handleTouchEnd = useCallback(() => {
    setOrigin({
      x: 0,
      y: 0,
      angle: Math.PI / 2,
      currentRadius: 0,
      originRadius: 0,
      isIn: true,
      isOn: false
    });
    setBall({
      x: '50%',
      y: '50%',
      position: 'absolute',
      background: 'rgba(0, 0, 0, 0.5)',
      boxShadow: '0 0 10px  rgba(0, 0, 0, 0.5)'
    });
  }, [touchDown]);

  return (
    <>
      {' '}
      <GamePad />
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
              position: joyStickBall.position as 'fixed' | 'absolute',
              background: joyStickBall.background,
              boxShadow: joyStickBall.boxShadow,
              top: joyStickBall.y,
              left: joyStickBall.x
            }}
          />
        </div>
      </div>
    </>
  );
}
