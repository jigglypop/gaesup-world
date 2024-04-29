var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useContext } from "react";
import { makeNormalCameraPosition } from "../../camera/control/normal";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
export function useFocus() {
    var _this = this;
    var _a = useContext(GaesupWorldContext), cameraOption = _a.cameraOption, activeState = _a.activeState, block = _a.block;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var dispatchAsync = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            dispatch({
                type: "update",
                payload: {
                    cameraOption: cameraOption,
                },
            });
            return [2 /*return*/];
        });
    }); };
    var close = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            block.control = true;
            block.animation = true;
            dispatch({
                type: "update",
                payload: {
                    block: block,
                },
            });
            return [2 /*return*/];
        });
    }); };
    var open = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            block.control = false;
            block.animation = false;
            dispatch({
                type: "update",
                payload: {
                    block: block,
                },
            });
            return [2 /*return*/];
        });
    }); };
    var on = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            cameraOption.focus = true;
            dispatch({
                type: "update",
                payload: {
                    cameraOption: cameraOption,
                },
            });
            return [2 /*return*/];
        });
    }); };
    var off = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            cameraOption.focus = false;
            dispatch({
                type: "update",
                payload: {
                    cameraOption: cameraOption,
                },
            });
            return [2 /*return*/];
        });
    }); };
    var focus = function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
        var zoom = _b.zoom, target = _b.target, position = _b.position;
        return __generator(this, function (_c) {
            if (zoom)
                cameraOption.zoom = zoom;
            cameraOption.position.lerp(position, 0.1);
            cameraOption.target.lerp(target, 0.1);
            return [2 /*return*/];
        });
    }); };
    var free = function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
        var zoom = _b.zoom;
        return __generator(this, function (_c) {
            if (zoom)
                cameraOption.zoom = zoom;
            cameraOption.position.lerp(makeNormalCameraPosition(activeState, cameraOption), 0.1);
            cameraOption.target.lerp(activeState.position.clone(), 0.1);
            return [2 /*return*/];
        });
    }); };
    var move = function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
        var newPosition = _b.newPosition;
        return __generator(this, function (_c) {
            cameraOption.position.lerp(newPosition.clone(), 0.1);
            return [2 /*return*/];
        });
    }); };
    var focusOn = function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
        var zoom = _b.zoom, target = _b.target, position = _b.position;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, close()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, on()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, move({ newPosition: position })];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, focus({ zoom: zoom, target: target, position: position })];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, dispatchAsync()];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var focusOff = function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
        var zoom = _b.zoom;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, open()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, off()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, move({
                            newPosition: makeNormalCameraPosition(activeState, cameraOption),
                        })];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, free({ zoom: zoom })];
                case 4:
                    _c.sent();
                    return [4 /*yield*/, dispatchAsync()];
                case 5:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        open: open,
        close: close,
        on: on,
        off: off,
        focus: focus,
        free: free,
        focusOn: focusOn,
        focusOff: focusOff,
    };
}
