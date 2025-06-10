"use client";

import ControlButtons from "@components/controlButtons";
import ZoomBar from "@components/zoomBar";
import initFooterOptionEffect from "./option";
export default function Foooter() {
  const { isOn } = initFooterOptionEffect();
  return (
    <>
      {isOn && (
        <>
          <ControlButtons />
          <ZoomBar />
          {/* <MiniMaps /> */}
        </>
      )}
    </>
  );
}
