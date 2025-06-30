"use client";

import Avatar from "@common/avatar";
import { useCheck } from "@store/check";
import { userType } from "@store/check/type";
import { buttonRecipe } from "@styles/recipe/button.css";
import { getRole } from "@utils/role";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as style from "./style.css";

export default function AuthHeader() {
  const { user, onLogout } = useCheck();

  const value = getRole((user as userType)?.roles);
  const roleMap: {
    [key: number]: [string, "pink" | "mint" | "gray"];
  } = {
    2: ["관리자", "pink"],
    1: ["매니저", "mint"],
    0: ["게스트", "gray"],
  };
  return (
    <div className={style.header}>
      {user && (
        <>
          <p>{(user as userType).name}</p>
          <Avatar
            imageUrl={"image/avatar/ally_avatar.webp"}
            styles={{ width: "3.5rem", height: "3.5rem" }}
            roleNumber={getRole((user as userType).roles)}
          />
          <button
            className={buttonRecipe({
              color: roleMap[value][1],
            })}
            style={assignInlineVars({
              fontSize: "1.3rem",
              width: "5rem",
            })}>
            {roleMap[value][0]}
          </button>

        </>
      )}
    </div>
  );
}
