import { inputRecipe } from "@styles/recipe/input.css";

// rgbInput
export const RgbInput = ({
  setRgb,
  rgbTag,
}: {
  setRgb: React.Dispatch<
    React.SetStateAction<{ r: number; g: number; b: number }>
  >;
  rgbTag: string;
}) => {
  return (
    <input
      className={inputRecipe({
        blackSmall: true,
      })}
      type={"number"}
      onChange={(e) =>
        setRgb((prev) => ({ ...prev, [rgbTag]: parseInt(e.target.value) }))
      }
    />
  );
};
