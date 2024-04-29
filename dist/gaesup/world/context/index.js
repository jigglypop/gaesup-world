import { euler, quat, vec3 } from "@react-three/rapier";
import { createContext } from "react";
import { V3 } from "../../utils/vector";
export var gaesupWorldDefault = {
    activeState: {
        position: V3(0, 5, 5),
        impulse: vec3(),
        velocity: vec3(),
        acceleration: vec3(),
        quat: quat(),
        euler: euler(),
        rotation: euler(),
        dir: vec3(),
        direction: vec3(),
    },
    mode: {},
    urls: {
        characterUrl: null,
        vehicleUrl: null,
        airplaneUrl: null,
        wheelUrl: null,
        ridingUrl: null,
    },
    states: {
        rideableId: null,
        isMoving: false,
        isNotMoving: false,
        isOnTheGround: false,
        isOnMoving: false,
        isRotated: false,
        isRunning: false,
        isJumping: false,
        enableRiding: false,
        isRiderOn: false,
        isLanding: false,
        isFalling: false,
        isRiding: false,
        isPush: {
            forward: false,
            backward: false,
            leftward: false,
            rightward: false,
        },
    },
    debug: false,
    minimap: {
        props: {},
    },
    clicker: {
        point: V3(0, 0, 0),
        angle: Math.PI / 2,
        isOn: false,
        isRun: false,
    },
    joystick: {
        joyStickOrigin: {
            x: 0,
            y: 0,
            angle: Math.PI / 2,
            currentRadius: 0,
            originRadius: 0,
            isIn: true,
            isOn: false,
            isUp: true,
            isCenter: true,
        },
        joyStickBall: {
            top: "50%",
            left: "50%",
        },
    },
    control: {
        forward: false,
        backward: false,
        leftward: false,
        rightward: false,
    },
    refs: null,
    animationState: {
        character: {
            current: "idle",
            default: "idle",
            store: {},
        },
        vehicle: {
            current: "idle",
            default: "idle",
            store: {},
        },
        airplane: {
            current: "idle",
            default: "idle",
            store: {},
        },
    },
    keyBoardMap: [
        { name: "forward", keys: ["ArrowUp", "KeyW"] },
        { name: "backward", keys: ["ArrowDown", "KeyS"] },
        { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
        { name: "rightward", keys: ["ArrowRight", "KeyD"] },
        { name: "space", keys: ["Space"] },
        { name: "shift", keys: ["Shift"] },
        { name: "keyZ", keys: ["KeyZ"] },
    ],
    cameraOption: {
        offset: V3(-10, -10, -10),
        maxDistance: -7,
        distance: -1,
        XDistance: 20,
        YDistance: 10,
        ZDistance: 20,
        zoom: 1,
        target: vec3(),
        position: vec3(),
        focus: false,
    },
    moveTo: null,
    rideable: {},
    sizes: {},
    block: {
        camera: false,
        control: false,
        animation: false,
        scroll: true,
    },
    callback: {
        moveTo: null,
    },
    clickerOption: {
        isRun: true,
    },
};
export var GaesupWorldContext = createContext(null);
export var GaesupWorldDispatchContext = createContext(null);
