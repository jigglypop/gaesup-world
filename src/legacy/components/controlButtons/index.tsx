"use client";

import { GamePad } from "gaesup-world";
import * as S from "./styles.css";
export default function ControlButtons() {
  return (
    <div className={S.controlButtons}>
      <GamePad
        label={{
          keyD: "🖐",
          space: "👣",
        }}
      />
    </div>
  );
}
