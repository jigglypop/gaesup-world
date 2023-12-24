var column = "column";
var row = "row";
var center = "center";
var left = "left";
var right = "right";
export var aligns = {
    justify: {
        center: {
            justifyContent: "center",
        },
        between: {
            justifyContent: "space-between",
        },
        around: {
            justifyContent: "space-around",
        },
        evenly: {
            justifyContent: "space-evenly",
        },
        start: {
            justifyContent: "flex-start",
        },
        end: {
            justifyContent: "flex-end",
        },
    },
    align: {
        center: {
            alignItems: "center",
        },
        between: {
            alignItems: "space-between",
        },
        around: {
            alignItems: "space-around",
        },
        evenly: {
            alignItems: "space-evenly",
        },
        start: {
            alignItems: "flex-start",
        },
        end: {
            alignItems: "flex-end",
        },
    },
    text: {
        center: {
            textAlign: center,
        },
        left: {
            textAlign: left,
        },
        right: {
            textAlign: right,
        },
    },
    direction: {
        row: {
            flexDirection: row,
        },
        column: {
            flexDirection: column,
        },
    },
};
