var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { assignInlineVars } from "@vanilla-extract/dynamic";
import { useContext } from "react";
import { vars } from "../../../styles/theme.css";
import { GaesupWorldContext } from "../../world/context";
import { KeyBoardAll } from "./constant";
import * as style from "./style.css";
export function KeyBoardToolTip(props) {
    var worldContext = useContext(GaesupWorldContext);
    var keyBoardMap = props.keyBoardMap, keyBoardToolTipInnerStyle = props.keyBoardToolTipInnerStyle, selectedKeyCapStyle = props.selectedKeyCapStyle, notSelectedkeyCapStyle = props.notSelectedkeyCapStyle, keyCapStyle = props.keyCapStyle, label = props.label;
    var animations = worldContext.animations, mode = worldContext.mode;
    var keyArray = Object.entries(KeyBoardAll).reduce(function (keyArray, cur) {
        var key = cur[0], value = cur[1];
        var gridRow = value.gridRow, gridColumn = value.gridColumn, name = value.name;
        var labeledName = (label === null || label === void 0 ? void 0 : label[name]) || name;
        var keyBoardItem = {
            code: value.code || key,
            gridRow: gridRow,
            gridColumn: gridColumn,
            name: labeledName,
        };
        keyArray.push(keyBoardItem);
        return keyArray;
    }, []);
    var codeToActionObj = keyBoardMap.reduce(function (maps, keyboardMapItem) {
        keyboardMapItem.keys.forEach(function (key) {
            maps[key] = keyboardMapItem.name;
        });
        return maps;
    }, {});
    return (_jsx(_Fragment, { children: mode.controller === "keyboard" && (_jsx("div", { className: style.keyBoardTooInner, style: assignInlineVars(keyBoardToolTipInnerStyle), children: keyArray.map(function (item, key) {
                var background = "rgba(0, 0, 0, 0.1)";
                var boxShadow = "0 0 5px rgba(0, 0, 0, 0.2)";
                var isSelect = "none";
                if (codeToActionObj[item.code]) {
                    if (animations.keyControl[codeToActionObj[item.code]]) {
                        isSelect = "select";
                        background = "".concat(vars.gradient.green);
                        boxShadow = "0 0 10px rgba(99,251,215,1)";
                    }
                    else {
                        isSelect = "notSelect";
                        background = "rgba(0, 0, 0, 0.6)";
                        boxShadow = "0 0 10px rgba(0, 0, 0, 0.6)";
                    }
                }
                var color = "white";
                if (codeToActionObj[item.code] &&
                    animations.keyControl[codeToActionObj[item.code]]) {
                    color = "black";
                }
                var keyStyle = keyCapStyle;
                if (isSelect === "select") {
                    keyStyle = __assign({}, selectedKeyCapStyle);
                }
                else if (isSelect === "notSelect") {
                    keyStyle = __assign({}, notSelectedkeyCapStyle);
                }
                return (_jsx("div", { className: style.keyCap, style: assignInlineVars(__assign({ background: background, boxShadow: boxShadow, color: color, gridRow: item.gridRow, gridColumn: item.gridColumn }, keyStyle)), children: item.name }, key));
            }) })) }));
}
