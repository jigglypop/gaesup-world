import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useContext } from "react";
import { vars } from "../../../styles/theme.css";
import { GaesupWorldContext } from "../../world/context";
import { KeyBoardAll } from "./constant";
import * as style from "./style.css";
import { keyArrayItemType, keyBoardToolTipPartialType } from "./type";

export function KeyBoardToolTip(props: keyBoardToolTipPartialType) {
  const worldContext = useContext(GaesupWorldContext);
  const {
    keyBoardMap,
    keyBoardToolTipStyle,
    keyBoardToolTipInnerStyle,
    keyCapStyle,
  } = props;
  const { animations, mode } = worldContext;

  const keyArray = Object.entries(KeyBoardAll).reduce<keyArrayItemType[]>(
    (keyArray, cur) => {
      const [key, value] = cur;
      const { gridRow, gridColumn, name } = value;

      const keyBoardItem: keyArrayItemType = {
        code: value.code || key,
        gridRow,
        gridColumn,
        name,
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
          className={style.keyBoardToolTip}
          style={assignInlineVars(keyBoardToolTipStyle)}
        >
          <div
            className={style.keyBoardTooInner}
            style={assignInlineVars(keyBoardToolTipInnerStyle)}
          >
            {keyArray.map((item: keyArrayItemType, key: number) => {
              let background = "rgba(0, 0, 0, 0.1)";
              let boxShadow = "0 0 5px rgba(0, 0, 0, 0.2)";

              if (codeToActionObj[item.code]) {
                if (animations.keyControl[codeToActionObj[item.code]]) {
                  background = `${vars.gradient.green}`;
                  boxShadow = `0 0 10px rgba(99,251,215,1)`;
                } else {
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

              return (
                <div
                  className={style.keyCap}
                  style={assignInlineVars({
                    background,
                    boxShadow,
                    color,
                    gridRow: item.gridRow,
                    gridColumn: item.gridColumn,
                    ...keyCapStyle,
                  })}
                  key={key}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
