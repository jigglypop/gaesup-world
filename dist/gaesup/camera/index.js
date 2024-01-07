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
import { jsx as _jsx } from "react/jsx-runtime";
import { CameraControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { vec3 } from "@react-three/rapier";
import { useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GaesupControllerContext } from "../controller/context";
import { GaesupWorldContext } from "../world/context";
import normal from "./control/normal";
import orbit from "./control/orbit";
import detector from "./detector";
export default function Camera(_a) {
    var _this = this;
    var refs = _a.refs, prop = _a.prop, control = _a.control;
    var worldContext = useContext(GaesupWorldContext);
    var controllerContext = useContext(GaesupControllerContext);
    var mode = worldContext.mode, cameraOption = worldContext.cameraOption;
    var rigidBodyRef = refs.rigidBodyRef, outerGroupRef = refs.outerGroupRef;
    var _b = useThree(), scene = _b.scene, camera = _b.camera;
    var cameraRef = useRef();
    var intersectObjectMap = useMemo(function () { return ({}); }, []);
    var cameraProp = __assign(__assign({}, prop), { control: control, controllerContext: controllerContext, worldContext: worldContext, intersectObjectMap: intersectObjectMap });
    var getMeshs = function (object) {
        if (object.userData && object.userData.intangible)
            return;
        if (object instanceof THREE.Mesh &&
            object.geometry.type !== "InstancedBufferGeometry") {
            intersectObjectMap[object.uuid] = object;
        }
        object.children.forEach(function (child) {
            getMeshs(child);
        });
    };
    useEffect(function () {
        scene.children.forEach(function (child) { return getMeshs(child); });
    }, []);
    var position = useMemo(function () { return camera.position; }, []);
    var dir = useMemo(function () { return vec3(); }, []);
    cameraProp.cameraRay.rayCast = new THREE.Raycaster(cameraProp.cameraRay.origin, cameraProp.cameraRay.dir, 0, -cameraOption.maxDistance);
    useEffect(function () {
        cameraProp.cameraRay.origin.copy(position);
        cameraProp.cameraRay.dir.copy(camera.getWorldDirection(dir));
    }, [cameraProp]);
    useFrame(function (state, delta) {
        if (!rigidBodyRef ||
            !rigidBodyRef.current ||
            !outerGroupRef ||
            !outerGroupRef.current)
            return;
        cameraProp.delta = delta;
        cameraProp.state = state;
        if (!worldContext.cameraBlock) {
            if (mode.control === "orbit") {
                orbit(cameraProp);
            }
            else if (mode.control === "normal") {
                normal(cameraProp);
            }
            detector(cameraProp);
        }
    });
    // moveTo 함수 정의
    worldContext.moveTo = function (position, target) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    camera.position.copy(position);
                    return [4 /*yield*/, Promise.all([
                            cameraRef.current.setPosition(position.x, position.y, position.z, true),
                            cameraRef.current.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, true),
                        ])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return _jsx(CameraControls, { ref: cameraRef });
}
