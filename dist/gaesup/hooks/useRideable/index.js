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
import { V3 } from "../../utils";
import { GaesupWorldContext, GaesupWorldDispatchContext, } from "../../world/context";
/**
 * Default rideable object properties.
 * @type {Object}
 */
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
/**
 * Custom hook for managing rideable objects.
 * @returns {Object} An object containing functions to initialize, set, get, ride, and land rideable objects.
 */
export function useRideable() {
    var _this = this;
    var worldContext = useContext(GaesupWorldContext);
    var dispatch = useContext(GaesupWorldDispatchContext);
    /**
     * Initialize a rideable object with the provided properties.
     * @param {rideableType} props - The properties of the rideable object to initialize.
     */
    var initRideable = function (props) {
        worldContext.rideable[props.objectkey] = __assign(__assign({}, rideableDefault), props);
    };
    /**
     * Set the properties of a rideable object.
     * @param {rideableType} props - The properties to set for the rideable object.
     */
    var setRideable = function (props) {
        worldContext.rideable[props.objectkey] = props;
    };
    /**
     * Get the rideable object with the specified object key.
     * @param {string} objectkey - The key of the rideable object to retrieve.
     * @returns {rideableType} The rideable object with the specified key.
     */
    var getRideable = function (objectkey) {
        return worldContext.rideable[objectkey];
    };
    /**
     * Handle landing of a rideable object.
     * @param {string} objectkey - The key of the rideable object to land.
     */
    var landing = function (objectkey) {
        var activeState = worldContext.activeState, vehicleCollider = worldContext.vehicleCollider, airplaneCollider = worldContext.airplaneCollider;
        worldContext.characterCollider.riderOffsetX = 0;
        worldContext.characterCollider.riderOffsetY = 0;
        worldContext.characterCollider.riderOffsetZ = 0;
        worldContext.states.isRiding = false;
        worldContext.rideable[objectkey].visible = true;
        worldContext.rideable[objectkey].position.copy(activeState.position
            .clone()
            .add(worldContext.rideable[objectkey].objectType === "vehicle"
            ? V3(vehicleCollider.vehicleSizeX, vehicleCollider.vehicleSizeY, vehicleCollider.vehicleSizeZ).multiplyScalar(1.5)
            : V3(airplaneCollider.airplaneSizeX, airplaneCollider.airplaneSizeY, airplaneCollider.airplaneSizeZ).multiplyScalar(1.5)));
        worldContext.rideable[objectkey].rotation.copy(activeState.euler.clone());
        dispatch({
            type: "update",
            payload: {
                rideable: __assign({}, worldContext.rideable),
                states: __assign({}, worldContext.states),
                characterCollider: __assign({}, worldContext.characterCollider),
            },
        });
    };
    /**
     * Set the URL properties of a rideable object. (inner function)
     * @param {rideableType} props - The properties containing URLs for the rideable object.
     */
    var setUrl = function (props) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (props.objectType === "vehicle") {
                worldContext.url.vehicleUrl = props.url;
                worldContext.url.wheelUrl = props.wheelUrl || null;
            }
            else if (props.objectType === "airplane") {
                worldContext.url.airplaneUrl = props.url;
            }
            dispatch({
                type: "update",
                payload: {
                    url: __assign({}, worldContext.url),
                },
            });
            return [2 /*return*/];
        });
    }); };
    /**
     * Set the mode and riding state for a rideable object. (inner function)
     * @param {rideableType} props - The properties of the rideable object to set mode and riding state.
     */
    var setModeAndRiding = function (props) { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            worldContext.mode.type = props.objectType;
            worldContext.states.isRiding = true;
            worldContext.states.isRiderOn = props.isRiderOn;
            worldContext.characterCollider.riderOffsetX = ((_a = props === null || props === void 0 ? void 0 : props.offset) === null || _a === void 0 ? void 0 : _a.x) || 0;
            worldContext.characterCollider.riderOffsetY = ((_b = props === null || props === void 0 ? void 0 : props.offset) === null || _b === void 0 ? void 0 : _b.y) || 0;
            worldContext.characterCollider.riderOffsetZ = ((_c = props === null || props === void 0 ? void 0 : props.offset) === null || _c === void 0 ? void 0 : _c.z) || 0;
            worldContext.rideable[props.objectkey].visible = false;
            dispatch({
                type: "update",
                payload: {
                    mode: __assign({}, worldContext.mode),
                    states: __assign({}, worldContext.states),
                    characterCollider: __assign({}, worldContext.characterCollider),
                },
            });
            return [2 /*return*/];
        });
    }); };
    /**
     * Handle the ride event for a rideable object.
     * @param {CollisionEnterPayload} e - The collision event payload.
     * @param {rideableType} props - The properties of the rideable object.
     */
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
