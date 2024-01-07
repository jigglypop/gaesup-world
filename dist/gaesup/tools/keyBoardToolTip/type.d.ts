import { CSSProperties } from "react";
export type keyboardMapType = {
    name: string;
    keys: string[];
    label?: string;
    match?: string;
}[];
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
    label?: Record<string, string>;
} & {
    [key in "keyBoardToolTipInnerStyle" | "notSelectedkeyCapStyle" | "selectedKeyCapStyle" | "keyCapStyle"]?: CSSProperties;
};
export type keyBoardToolTipPartialType = Partial<keyBoardToolTipType>;
