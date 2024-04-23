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
import { euler, vec3 } from "@react-three/rapier";
import { useContext } from "react";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
import { useGaesupGltf } from "../useGaesupGltf";
export var rideableDefault = {
    objectkey: null,
    objectType: null,
    isRiderOn: false,
    url: null,
    wheelUrl: null,
    position: vec3(),
    rotation: euler(),
    offset: vec3(),
    visible: true,
};
export function useRideable() {
    var _this = this;
    var worldContext = useContext(GaesupWorldContext);
    var urls = worldContext.urls, states = worldContext.states, rideable = worldContext.rideable, mode = worldContext.mode;
    var dispatch = useContext(GaesupWorldDispatchContext);
    var getSizesByUrls = useGaesupGltf().getSizesByUrls;
    var initRideable = function (props) {
        rideable[props.objectkey] = __assign(__assign({}, rideableDefault), props);
    };
    var setRideable = function (props) {
        rideable[props.objectkey] = props;
    };
    var getRideable = function (objectkey) {
        return rideable[objectkey];
    };
    var landing = function (objectkey) {
        var activeState = worldContext.activeState, refs = worldContext.refs;
        states.enableRiding = false;
        states.isRiderOn = false;
        states.rideableId = null;
        var modeType = rideable[objectkey].objectType;
        var _a = getSizesByUrls(urls), vehicleUrl = _a.vehicleUrl, airplaneUrl = _a.airplaneUrl, characterUrl = _a.characterUrl;
        var size = modeType === "vehicle" ? vehicleUrl : airplaneUrl;
        var mySize = characterUrl;
        rideable[objectkey].visible = true;
        rideable[objectkey].position.copy(activeState.position.clone());
        if (refs && refs.rigidBodyRef) {
            refs.rigidBodyRef.current.setTranslation(activeState.position
                .clone()
                .add(size.clone().add(mySize.clone()).addScalar(1)), false);
        }
        dispatch({
            type: "update",
            payload: {
                rideable: __assign({}, rideable),
                states: __assign({}, states),
                activeState: __assign({}, activeState),
            },
        });
    };
    var setUrl = function (props) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            urls.ridingUrl = props.ridingUrl || urls.characterUrl || null;
            if (props.objectType === "vehicle") {
                urls.vehicleUrl = props.url;
                urls.wheelUrl = props.wheelUrl || null;
            }
            else if (props.objectType === "airplane") {
                urls.airplaneUrl = props.url;
            }
            dispatch({
                type: "update",
                payload: {
                    urls: __assign({}, urls),
                },
            });
            return [2 /*return*/];
        });
    }); };
    var setModeAndRiding = function (props) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            mode.type = props.objectType;
            states.enableRiding = props.enableRiding;
            states.isRiderOn = true;
            states.rideableId = props.objectkey;
            rideable[props.objectkey].visible = false;
            dispatch({
                type: "update",
                payload: {
                    mode: __assign({}, mode),
                    states: __assign({}, states),
                },
            });
            return [2 /*return*/];
        });
    }); };
    var ride = function (e, props) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(e.other.rigidBodyObject.name === "character")) return [3 /*break*/, 3];
                    return [4 /*yield*/, setUrl(props)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, setModeAndRiding(props)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return {
        initRideable: initRideable,
        setRideable: setRideable,
        getRideable: getRideable,
        ride: ride,
        landing: landing,
    };
}
