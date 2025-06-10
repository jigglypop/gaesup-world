"use client";

import { useAtom } from "jotai";
import { useEffect } from "react";
import { zoomAtom } from "./atom";

export default function usePinchZoomEffect() {
  const [_, setZooms] = useAtom(zoomAtom);
  const pinchList: Touch[] = [];
  let dist = -1;
  function start(e: TouchEvent) {
    const touches = e.changedTouches;
    if (pinchList.length + touches.length <= 2) {
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        pinchList.push(touch);
      }
    }
  }

  function end(e: TouchEvent) {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const index = pinchList.findIndex(
        (ev) => ev.identifier === touch.identifier
      );
      if (index > -1) {
        pinchList.splice(index, 1);
      }
    }
  }

  function play(e: TouchEvent) {
    const touches = e.changedTouches;

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const index = pinchList.findIndex(
        (ev) => ev.identifier === touch.identifier
      );
      if (index !== -1) {
        pinchList[index] = touch;

        if (pinchList.length === 2) {
          const dx = pinchList[0].clientX - pinchList[1].clientX;
          const dy = pinchList[0].clientY - pinchList[1].clientY;
          const _dist = Math.sqrt(dx ** 2 + dy ** 2);

          if (dist > 0) {
            const dz = (_dist - dist) / 100;
            setZooms((prev) => ({
              ...prev,
              zoom:
                prev.zoom + dz <= 3
                  ? prev.zoom + dz > 1
                    ? prev.zoom + dz
                    : 1
                  : 3,
            }));
          }
          dist = _dist;
        }
      }
    }
  }

  useEffect(() => {
    window.addEventListener("touchstart", start);
    window.addEventListener("touchmove", play);
    window.addEventListener("touchend", end);
    window.addEventListener("touchcancel", play);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove", play);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", play);
    };
  }, []);
}
