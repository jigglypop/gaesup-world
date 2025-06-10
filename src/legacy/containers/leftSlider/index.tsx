"use client";

import SaveButtons from "@components/saveButtons";
import useMesh from "@store/mesh";
import * as S from "./styles.css";
import Taps from "./tap";
import MeshBlock from "./tap/mesh";

export default function LeftSlider() {
  const { current_id } = useMesh();
  return (
    <div className={S.leftSlider}>
      <SaveButtons />
      <Taps />
      {current_id && <MeshBlock />}
    </div>
  );
}
