"use client";

import Cancel from "@common/cancel";
import useMesh from "@store/mesh";
import useModal from "@store/modal";
import useWallParent from "@store/wallParent";
import { useWallParentQuery } from "@store/wallParent/query";
import { buttonRecipe } from "@styles/recipe/button.css";
import { inputRecipe } from "@styles/recipe/input.css";
import { vars } from "@styles/theme.css";
import * as S from "./styles.css";

export default function WallTap() {
  const { selectWallParent, wall_parent_id, newWallParent, onChangeName } =
    useWallParent();
  const { setCurrentId, current_id } = useMesh();
  const { openModal } = useModal();
  const { onWallParentCreate } = useWallParent();
  const { wallParentMap } = useWallParentQuery();

  return (
    <div className={S.inner}>
      <div className={S.innerTitles}>
        <div className={S.innerTitleItem}>벽</div>
      </div>

      <>
        <div className={S.subTitle}>신규 벽 포맷 이름</div>
        <input
          value={newWallParent.name}
          onChange={onChangeName}
          className={inputRecipe({
            white: true,
          })}></input>
        <div
          className={buttonRecipe({
            color: "mint",
            shape: "smallSquare",
          })}
          onClick={async () => await onWallParentCreate()}>
          벽 포멧 생성
        </div>
      </>
      <div className={S.parentList}>
        {wallParentMap &&
          Object.values(wallParentMap).map((item, key) => (
            <div
              key={key}
              className={S.parent}
              onClick={() => selectWallParent({ id: item.wall_parent_id })}
              style={{
                background:
                  wall_parent_id === item.wall_parent_id
                    ? vars.gradient.mint
                    : "rgba(255,255,255,0.1)",
                color:
                  wall_parent_id === item.wall_parent_id
                    ? "rgba(0,0,0,0.9)"
                    : "rgba(255,255,255,0.9)",
              }}>
              <Cancel
                onClick={() => {
                  openModal({
                    type: "delete_wall_parent",
                  });
                }}
                varients={{
                  color: "gray",
                  positions: "tap",
                }}
              />
              {item.name}
            </div>
          ))}
      </div>
      {wallParentMap && wallParentMap[wall_parent_id] && (
        <>
          <div className={S.subTitle}>메쉬 선택</div>
          <div className={S.meshList}>
            {Object.entries(wallParentMap[wall_parent_id])
              .filter((item) => {
                return (
                  item[0] === "front_mesh_id" ||
                  item[0] === "back_mesh_id" ||
                  item[0] === "bone_mesh_id"
                );
              })
              .map((item, key) => (
                <div
                  key={key}
                  className={S.mesh}
                  onClick={() => {
                    if (typeof item[1] === "string") {
                      setCurrentId(item[1]);
                    }
                  }}
                  style={{
                    background:
                      current_id === item[1]
                        ? vars.gradient.mint
                        : "rgba(255,255,255,0.1)",
                    color:
                      current_id === item[1]
                        ? "rgba(0,0,0,0.9)"
                        : "rgba(255,255,255,0.9)",
                  }}>
                  {item[0].split("_")[0]}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
