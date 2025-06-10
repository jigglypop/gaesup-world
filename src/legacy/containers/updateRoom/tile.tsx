"use client";

import { inputRecipe } from "@styles/recipe/input.css";
import { useState } from "react";
import * as S from "./styles.css";

export function TileLeft() {
  const [_, setUrl] = useState("");

  return (
    <>
      <div className={S.updateGltfInfo}>
        <div className={S.title}>종류</div>
        <div className={S.updateGltfButtonsInner}></div>
      </div>

      <div className={S.updateGltfInfo}>
        <div className={S.title}>이미지</div>
        <div className={S.updateInputImage}>
          <input
            className={inputRecipe({
              black: true,
            })}
            onChange={(e) => setUrl(e.target.value)}></input>
          {/* <div
            className={S.gltfButton}
            onClick={() => setImageUrl({ image_url: url })}>
            바꾸기
          </div> */}
        </div>
      </div>
    </>
  );
}
