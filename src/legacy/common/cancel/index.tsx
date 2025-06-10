"use client";

import { MdCancel } from "@react-icons/all-files/md/MdCancel";
import { CSSProperties } from "react";
import { cancelRecipe, cancelRecipeType } from "./recipe.css";

export default function Cancel({
  onClick,
  onMouseUp,
  varients,
  styles,
}: {
  onClick?: () => void;
  onMouseUp?: () => void;
  varients: cancelRecipeType;
  styles?: CSSProperties;
}) {
  return (
    <div
      className={cancelRecipe(varients)}
      onClick={onClick}
      onMouseUp={onMouseUp}
      style={{ ...styles }}>
      <MdCancel />
    </div>
  );
}
