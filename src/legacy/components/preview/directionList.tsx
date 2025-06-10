import { directionType } from "./type";

export const directionList: directionType[] = [
  {
    di: { y: Math.PI / 2 },
    gridColumn: "2 / 3",
    gridRow: "2 / 3",
    name: "S",
  },
  { di: { y: Math.PI }, gridColumn: "3 / 4", gridRow: "2 / 3", name: "E" },
  {
    di: { y: (Math.PI * 3) / 2 },
    gridColumn: "2 / 3",
    gridRow: "1 / 2",
    name: "N",
  },
  {
    di: { y: Math.PI * 2 },
    gridColumn: "1 / 2",
    gridRow: "2 / 3",
    name: "W",
  },
];
