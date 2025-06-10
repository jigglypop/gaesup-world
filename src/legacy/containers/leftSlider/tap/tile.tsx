"use client";

import Cancel from "@common/cancel";
import useMesh from "@store/mesh";
import useModal from "@store/modal";
import useTileParent from "@store/tileParent";
import { useTileParentQuery } from "@store/tileParent/query";
import { buttonRecipe } from "@styles/recipe/button.css";
import { inputRecipe } from "@styles/recipe/input.css";
import { vars } from "@styles/theme.css";
import * as S from "./styles.css";

export default function TileTap() {
  const {
    tile_parent_id,
    tileParent,
    selectTileParent,
    onChangeName,
    newTileParent,
  } = useTileParent();
  const { setCurrentId, current_id } = useMesh();
  const { openModal } = useModal();
  const { onTileParentCreate } = useTileParent();
  const { tileParentMap } = useTileParentQuery();
  return (
    <div className={S.inner}>
      <div className={S.innerTitles}>
        <div className={S.innerTitleItem}>타일</div>
      </div>

      <>
        <div className={S.subTitle}>신규 타일 포맷 생성</div>
        <input
          value={newTileParent.map_text}
          onChange={onChangeName}
          className={inputRecipe({
            white: true,
          })}></input>
        <div
          className={buttonRecipe({
            color: "mint",
            shape: "smallSquare",
          })}
          onClick={async () => await onTileParentCreate()}>
          타일 포멧 생성
        </div>
      </>

      <div className={S.parentList}>
        {tileParentMap &&
          Object.values(tileParentMap).map((item, key) => (
            <div
              key={key}
              className={S.parent}
              onClick={() => selectTileParent({ id: item.tile_parent_id })}
              style={{
                background:
                  tileParent?.tile_parent_id === item.tile_parent_id
                    ? vars.gradient.mint
                    : "rgba(255,255,255,0.1)",
                color:
                  tileParent?.tile_parent_id === item.tile_parent_id
                    ? "rgba(0,0,0,0.9)"
                    : "rgba(255,255,255,0.9)",
              }}>
              <Cancel
                onClick={() =>
                  openModal({
                    type: "delete_tile_parent",
                  })
                }
                varients={{
                  color: "gray",
                }}
                styles={{
                  position: "absolute",
                  top: "-1rem",
                  right: "-1rem",
                  width: "2rem",
                  height: "2rem",
                  boxShadow: "0 0 1rem rgba(0,0,0,0.5)",
                  border: "0.1rem solid rgba(0,0,0,0.5)",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "rgba(255,255,255,0.8)",
                }}
              />
              {item.map_text}
            </div>
          ))}
      </div>
      {tileParent && (
        <>
          <div className={S.subTitle}>메쉬 선택</div>
          <div className={S.meshList}>
            {tileParentMap &&
              tileParentMap[tile_parent_id] &&
              Object.entries(tileParentMap[tile_parent_id])
                .filter((item) => {
                  return item[0].split("_")[0] === "floor";
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
