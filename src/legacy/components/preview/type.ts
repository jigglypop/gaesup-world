export type blockType = {
  block: "none" | "blockA" | "blockB" | "all";
  gridColumn: string;
  gridRow: string;
  name: "양면 (num1)" | "개방 (num4)" | "좌측 (num2)" | "우측 (num3)";
};

export type diType = "S" | "E" | "N" | "W";

export type directionType = {
  di: { y: number };
  gridColumn: string;
  gridRow: string;
  name: diType;
  dx?: number;
  dz?: number;
};
