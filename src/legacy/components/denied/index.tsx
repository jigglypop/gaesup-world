"use client";

import { useCheck } from "@store/check";
import { buttonRecipe } from "@styles/recipe/button.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { Link } from "react-router-dom";
import * as S from "./style.css";

export default function Denied() {
  const { onLogout } = useCheck();

  return (
    <div className={S.denied}>
      <h1>403</h1>
      <h2>FORBIDDEN</h2>
      <p>접근 권한이 부족합니다</p>
      <div className={S.buttons}>
        <Link
          to="/aggjack/"
          className={buttonRecipe({
            color: "purple",
          })}
          style={assignInlineVars({
            fontSize: "2rem",
            width: "8.5rem",
            height: "4rem",
          })}>
          홈으로
        </Link>
        <Link
          to="/aggjack/"
          className={buttonRecipe({
            color: "gray",
          })}
          style={assignInlineVars({
            fontSize: "2rem",
            width: "8.5rem",
            height: "4rem",
          })}
          onClick={onLogout}>
          로그아웃
        </Link>
      </div>
    </div>
  );
}
