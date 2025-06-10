import { FC } from "react";

export type NameTagProps = {
  text: string;
  textLength?: number;
  children?: React.ReactNode;
  background: string;
  borderColor?: string;
  width?: number;
  height?: number;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
};

export interface INameTag extends FC<NameTagProps> {}
