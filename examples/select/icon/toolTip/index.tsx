import * as style from "./style.css";

export type toolTipType = {
  text?: string;
  onLogout?: (e) => void;
};
export const ToolTip = ({ text }: toolTipType) => {
  return <div className={style.tooltip}>{text}</div>;
};
