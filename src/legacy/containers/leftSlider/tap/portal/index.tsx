"use client";

import usePortal from "@store/portal";
import { inputRecipe } from "@styles/recipe/input.css";
import { ChangeEvent, useCallback } from "react";
import * as S from "./styles.css";

export default function PortalTap() {
  const { setPortalName, portal } = usePortal();
  const onChangePortal = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPortalName(e.target.value);
    },
    [setPortalName]
  );

  return (
    <div className={S.inner}>
      <div className={S.innerTitles}>
        <div className={S.innerTitleItem}>포탈</div>
      </div>
      <div className={S.subTitle}>포탈 이름</div>
      <input
        value={portal.current ? portal.current.title : ""}
        onChange={onChangePortal}
        className={inputRecipe({
          white: true,
        })}></input>
    </div>
  );
}
