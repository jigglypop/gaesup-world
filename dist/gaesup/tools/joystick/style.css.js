import { style } from "@vanilla-extract/css";
export var joyStick = style([
    {
        position: "fixed",
        bottom: "0",
        right: "0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        textAlign: "center",
        width: "100%",
    },
]);
export var joyStickInner = style([
    {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        margin: "5rem",
        padding: "1rem",
        width: "12rem",
        height: "12rem",
        overflow: "auto",
        borderRadius: "50%",
        background: "rgba(0, 0, 0, 0.5)",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        ":after": {
            content: "''",
            width: "10rem",
            height: "10rem",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.2)",
        },
    },
]);
export var joystickBall = style([
    {
        width: "5rem",
        height: "5rem",
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: "rgba(0, 0, 0, 0.5)",
        boxShadow: "0 0 10px  rgba(0, 0, 0, 0.5)",
        cursor: "pointer",
    },
]);