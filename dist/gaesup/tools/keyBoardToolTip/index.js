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
    var keyBoardMap = props.keyBoardMap, keyBoardToolTipInnerStyle = props.keyBoardToolTipInnerStyle, keyCapStyle = props.keyCapStyle;
    var animations = worldContext.animations, mode = worldContext.mode;
    var keyArray = Object.entries(KeyBoardAll).reduce(function (keyArray, cur) {
        var key = cur[0], value = cur[1];
        var gridRow = value.gridRow, gridColumn = value.gridColumn, name = value.name;
        var keyBoardItem = {
            code: value.code || key,
            gridRow: gridRow,
            gridColumn: gridColumn,
            name: name,
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
                if (codeToActionObj[item.code]) {
                    if (animations.keyControl[codeToActionObj[item.code]]) {
                        background = "".concat(vars.gradient.green);
                        boxShadow = "0 0 10px rgba(99,251,215,1)";
                    }
                    else {
                        background = "rgba(0, 0, 0, 0.6)";
                        boxShadow = "0 0 10px rgba(0, 0, 0, 0.6)";
                    }
                }
                var color = "white";
                if (codeToActionObj[item.code] &&
                    animations.keyControl[codeToActionObj[item.code]]) {
                    color = "black";
                }
                return (_jsx("div", { className: style.keyCap, style: assignInlineVars(__assign({ background: background, boxShadow: boxShadow, color: color, gridRow: item.gridRow, gridColumn: item.gridColumn }, keyCapStyle)), children: item.name }, key));
            }) })) }));
}
