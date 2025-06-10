"use client";

import ToggleSlider from "@common/toggleSlider";
import useMesh from "@store/mesh";
import useThreeObjectType from "@store/update/hooks/objectType";
import { objectTypeString } from "@store/update/type";
import { buttonRecipe } from "@styles/recipe/button.css";
import { convertObjectType } from "@utils/object";
import * as S from "./styles.css";

export default function SelectObjectType() {
  const { changeObjectType, object_type } = useThreeObjectType();
  const { typeToTag } = convertObjectType();
  const { selectTapName } = useMesh();
  return (
    <div className={S.selectType}>
      <ToggleSlider
        tag={`타입 : ${typeToTag(object_type)}`}
        widthArray={[10, 30]}
        heightArray={[4, 10]}>
        <div className={S.tapButtons}>
          {["tile", "wall", "npc", "npc"].map((item, key) => (
            <div
              key={key}
              className={`${buttonRecipe({
                color: object_type !== item ? "gray" : "pink",
              })} ${S.gltfButton}`}
              onClick={() => {
                changeObjectType(item as objectTypeString);
                selectTapName("기존");
              }}>
              {typeToTag(item as objectTypeString)}
            </div>
          ))}
        </div>
      </ToggleSlider>
    </div>
  );
}
