"use client";

import { RiZoomInFill } from "@react-icons/all-files/ri/RiZoomInFill";
import { zoomAtom } from "@store/zoom/atom";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { Range } from "react-range";
import * as S from "./style.css";

export default function ZoomControlUI() {
  const [{ zoom }, setZoom] = useAtom(zoomAtom);

  const onChanges = useCallback(
    (value: number[]) => {
      setZoom((prev) => ({ ...prev, zoom: value[0] }));
    },
    [setZoom]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      setZoom((prev) => {
        const newZoom = Math.max(
          1,
          Math.min(3, prev.zoom - event.deltaY * 0.001)
        );
        return { ...prev, zoom: newZoom };
      });
    },
    [setZoom]
  );

  useEffect(() => {
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  return (
    <>
      <div className={S.zoomText}>{`${Math.round(zoom * 100)}%`}</div>
      <div className={S.zoomBarOuter}>
        <Range
          step={0.1}
          min={1}
          max={3}
          values={[zoom]}
          onChange={onChanges}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              key={"zoomBar"}
              className={S.bar}>
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div
              {...props}
              key={"zoomBall"}
              className={S.zoomBall}>
              <RiZoomInFill />
            </div>
          )}
        />
      </div>
    </>
  );
}
