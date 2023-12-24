import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useContext } from "react";
import { vars } from "../../../styles/theme.css";
import { GaesupWorldContext } from "../../world/context";
import { KeyBoardAll } from "./constant";
import * as style from "./style.css";
import { keyArrayItemType, keyBoardToolTipType } from "./type";

export function KeyBoardToolTip(props: keyBoardToolTipType) {
  const worldContext = useContext(GaesupWorldContext);
  const {
    keyBoardMap,
    keyBoardToolTipInnerStyle,
    selectedKeyCapStyle,
    notSelectedkeyCapStyle,
    keyCapStyle,
    label,
  } = props;
  const { animations, mode } = worldContext;

  const keyArray = Object.entries(KeyBoardAll).reduce<keyArrayItemType[]>(
    (keyArray, cur) => {
      const [key, value] = cur;
      const { gridRow, gridColumn, name } = value;
      const labeledName = label?.[name] || name;

      const keyBoardItem: keyArrayItemType = {
        code: value.code || key,
        gridRow,
        gridColumn,
        name: labeledName,
      };
      keyArray.push(keyBoardItem);
      return keyArray;
    },
    []
  );

  const codeToActionObj = keyBoardMap.reduce((maps, keyboardMapItem) => {
    keyboardMapItem.keys.forEach((key) => {
      maps[key] = keyboardMapItem.name;
    });
    return maps;
  }, {});

  return (
    <>
      {mode.controller === "keyboard" && (
        <div
          className={style.keyBoardTooInner}
          style={assignInlineVars(keyBoardToolTipInnerStyle)}
        >
          {keyArray.map((item: keyArrayItemType, key: number) => {
            let background = "rgba(0, 0, 0, 0.1)";
            let boxShadow = "0 0 5px rgba(0, 0, 0, 0.2)";
            let isSelect = "none";

            if (codeToActionObj[item.code]) {
              if (animations.keyControl[codeToActionObj[item.code]]) {
                isSelect = "select";
                background = `${vars.gradient.green}`;
                boxShadow = `0 0 10px rgba(99,251,215,1)`;
              } else {
                isSelect = "notSelect";
                background = "rgba(0, 0, 0, 0.6)";
                boxShadow = "0 0 10px rgba(0, 0, 0, 0.6)";
              }
            }
            let color = "white";
            if (
              codeToActionObj[item.code] &&
              animations.keyControl[codeToActionObj[item.code]]
            ) {
              color = "black";
            }

            let keyStyle = keyCapStyle;
            if (isSelect === "select") {
              keyStyle = {
                ...selectedKeyCapStyle,
              };
            } else if (isSelect === "notSelect") {
              keyStyle = {
                ...notSelectedkeyCapStyle,
              };
            }

            return (
              <div
                className={style.keyCap}
                style={assignInlineVars({
                  background,
                  boxShadow,
                  color,
                  gridRow: item.gridRow,
                  gridColumn: item.gridColumn,
                  ...keyStyle,
                })}
                key={key}
              >
                {item.name}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
