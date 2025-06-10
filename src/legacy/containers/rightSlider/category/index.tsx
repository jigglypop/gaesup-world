"use client";

import useGltfList from "@store/gltfList";
import { buttonRecipe } from "@styles/recipe/button.css";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import * as S from "./styles.css";

export default function Category() {
  const {
    selectGltfAndRoom,
    object_type,
    category_list,
    gltfModelList,
    selectCategory,
    gltf_url,
    category,
  } = useGltfList();

  const buttonRecipes = (tag: string, _tag: string) =>
    buttonRecipe({
      color: tag === _tag ? "mint" : "gray",
      disabled: tag !== _tag,
    });

  return (
    <div className={S.outer}>
      {object_type === "normal" && (
        <>
          <div className={S.subtitle}>카테고리</div>
          <div className={S.category}>
            {category_list.map((item, key) => (
              <div
                key={key}
                className={`${S.categoryButton} ${buttonRecipes(category, item)}`}
                onClick={() => {
                  selectCategory(item);
                }}>
                {item}
              </div>
            ))}
          </div>

          <div className={S.subtitle}>3D 모델 {gltf_url}</div>

          <div className={S.list}>
            {gltfModelList.map((item, key) => (
              <p
                key={key}
                onClick={() => {
                  selectGltfAndRoom(item);
                }}
                style={assignInlineVars({
                  textDecorationLine:
                    gltf_url === item.gltf_url ? "underline" : "none",
                })}>
                {item.object_name}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
