import { mainButton } from "@/components/main/style.css";
import { fixed, flex, grid } from "@styles/recipe/index.css";
import { style } from "@vanilla-extract/css";

export const gamePad = style([
  fixed({
    south_west: true,
  }),
  flex({
    column: "6",
  }),
  {
    width: "10vw",
    zIndex: 10000,
  },
]);

export const gamePadInner = style([
  grid({
    column: "center",
  }),
  {
    margin: "1rem",
    padding: "2rem",
  },
]);

// export const gamePadButtonRecipe = recipe({
//   base: [
//     flex_relative({}),
//     glass({}),
//     {
//       all: "unset",
//       width: "4rem",
//       height: "4rem",
//       margin: "0.3rem",
//       borderRadius: "50%",
//       fontSize: "1rem",
//       color: "black",
//       textShadow: "0 0 10px black",
//       cursor: "pointer",
//       transition: "all 0.3s ease-in",
//     },
//   ],
// });
export const gamePadButtonRecipe = style([mainButton({})]);
