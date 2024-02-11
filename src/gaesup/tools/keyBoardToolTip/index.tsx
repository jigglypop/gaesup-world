import { useContext } from "react";
import { GaesupWorldContext } from "../../world/context";
import { KeyBoardAll } from "./constant";
import "./style.css";
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
  const { mode, control } = worldContext;

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
      {mode.controller === "keyboard" ||
        (mode.controller === "clicker" && !mode.isButton && (
          <div className="keyBoardToolInner" style={keyBoardToolTipInnerStyle}>
            {keyArray.map((item: keyArrayItemType, key: number) => {
              let background = "rgba(0, 0, 0, 0.1)";
              let boxShadow = "0 0 5px rgba(0, 0, 0, 0.2)";
              let isSelect = "none";

              if (codeToActionObj[item.code]) {
                if (control[codeToActionObj[item.code]]) {
                  isSelect = "select";
                  background = `linear-gradient( 68.4deg,  rgba(99,251,215,1) -0.4%, rgba(5,222,250,1) 100.2% )`;
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
                control[codeToActionObj[item.code]]
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
                  className="keyCap"
                  style={{
                    background,
                    boxShadow,
                    color,
                    gridRow: item.gridRow,
                    gridColumn: item.gridColumn,
                    ...keyStyle,
                  }}
                  key={key}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
        ))}
    </>
  );
}
