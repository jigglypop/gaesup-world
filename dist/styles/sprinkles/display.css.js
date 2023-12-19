import { defineProperties } from "@vanilla-extract/sprinkles";
export var displayProperties = defineProperties({
    conditions: {
        mobile: {},
        tablet: { "@media": "(min-width: 768px)" },
        laptop: { "@media": "(min-width: 1024px)" },
        desktop: { "@media": "(min-width: 1440px)" },
    },
    defaultCondition: "mobile",
    properties: {
        display: ["none", "flex", "block", "inline", "grid"],
        flexDirection: ["row", "column"],
        justifyContent: [
            "stretch",
            "flex-start",
            "center",
            "flex-end",
            "space-around",
            "space-between",
        ],
        alignItems: ["stretch", "flex-start", "center", "flex-end"],
        textAlign: ["left", "center", "right"],
    },
});
