import { CSSProperties } from "react";
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
    on?: boolean;
    keyBoardLabel?: keyBoardLabelType;
    keyBoardMap?: keyboardMapItemType[];
    keyBoardToolTipStyle?: CSSProperties;
    keyBoardToolTipInnerStyle?: CSSProperties;
    keyCapStyle?: CSSProperties;
};
