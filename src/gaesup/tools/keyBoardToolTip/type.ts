import { VECssType } from "../type";

export type keyMapItemType = {
  name: string;
  gridRow: string;
  gridColumn: string;
  code?: string;
};

export type keyArrayItemType = {
  code: string;
  gridRow: string;
  gridColumn: string;
  name: string;
};

export type keyboardMapItemType = {
  name: string;
  keys: string[];
};

export type keyBoardMapType = {
  [name: string]: keyMapItemType;
};

export type keyBoardLabelType = {
  [name: string]: string;
};

export type keyBoardToolTipType = {
  keyBoardLabel?: keyBoardLabelType;
  keyBoardMap?: keyboardMapItemType[];
} & {
  [key in
    | "keyBoardToolTipStyle"
    | "keyBoardToolTipInnerStyle"
    | "keyCapStyle"]?: VECssType;
};

export type keyBoardToolTipPartialType = Partial<keyBoardToolTipType>;
