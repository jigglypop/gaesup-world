export declare const glass: import("@vanilla-extract/recipes").RuntimeFn<{
    [x: string]: {
        [x: string]: string | import("@vanilla-extract/css").ComplexStyleRule;
    };
}>;
export declare const baseVarients: {
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
};
export declare const gridVarient: {
    sideBar: string;
    postA: string;
    postB: string;
    "1,2": string;
    "1,3": string;
    "1,4": string;
    "2,1": string;
    "2,3": string;
    "2,4": string;
    "1": string;
    "2": string;
    "3": string;
    "4": string;
    "5": string;
    writeA: string;
    writeB: string;
    "15rem": string;
    "10rem": string;
};
export declare const gridVarients: {
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
};
export declare const gridBaseVarients: {
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
};
export declare const relative: import("@vanilla-extract/recipes").RuntimeFn<{
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const absolute: import("@vanilla-extract/recipes").RuntimeFn<{
    center: {
        true: {
            top: "50%";
            left: "50%";
            transform: "translate(-50%, -50%)";
        };
    };
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const fixed: import("@vanilla-extract/recipes").RuntimeFn<{
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const flex: import("@vanilla-extract/recipes").RuntimeFn<{
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const grid: import("@vanilla-extract/recipes").RuntimeFn<{
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const flex_relative: import("@vanilla-extract/recipes").RuntimeFn<{
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const flex_absolute: import("@vanilla-extract/recipes").RuntimeFn<{
    center: {
        true: {
            top: "50%";
            left: "50%";
            transform: "translate(-50%, -50%)";
        };
    };
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const flex_fixed: import("@vanilla-extract/recipes").RuntimeFn<{
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const grid_relative: import("@vanilla-extract/recipes").RuntimeFn<{
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const grid_absolute: import("@vanilla-extract/recipes").RuntimeFn<{
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const grid_fixed: import("@vanilla-extract/recipes").RuntimeFn<{
    gridTemplateRows: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gridTemplateColumns: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtr: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gtc: {
        sideBar: string;
        postA: string;
        postB: string;
        "1,2": string;
        "1,3": string;
        "1,4": string;
        "2,1": string;
        "2,3": string;
        "2,4": string;
        "1": string;
        "2": string;
        "3": string;
        "4": string;
        "5": string;
        writeA: string;
        writeB: string;
        "15rem": string;
        "10rem": string;
    };
    gr: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    gc: {
        "1/2": string;
        "1/3": string;
        "2/3": string;
        "1/4": string;
        "2/4": string;
        "3/4": string;
        "1/5": string;
        "2/5": string;
        "3/5": string;
        "4/5": string;
    };
    fullXY: {
        width: string;
        height: string;
    };
    justify: {
        center: {
            justifyContent: string;
        };
        between: {
            justifyContent: string;
        };
        around: {
            justifyContent: string;
        };
        evenly: {
            justifyContent: string;
        };
        start: {
            justifyContent: string;
        };
        end: {
            justifyContent: string;
        };
    };
    align: {
        center: {
            alignItems: string;
        };
        between: {
            alignItems: string;
        };
        around: {
            alignItems: string;
        };
        evenly: {
            alignItems: string;
        };
        start: {
            alignItems: string;
        };
        end: {
            alignItems: string;
        };
    };
    text: {
        center: {
            textAlign: "center";
        };
        left: {
            textAlign: "left";
        };
        right: {
            textAlign: "right";
        };
    };
    direction: {
        row: {
            flexDirection: "row";
        };
        column: {
            flexDirection: "column";
        };
    };
    row: {
        center: {
            alignItems: string;
            justifyContent: string;
        };
        "12": {
            alignItems: string;
            justifyContent: string;
        };
        "10": {
            alignItems: string;
            justifyContent: string;
        };
        "2": {
            alignItems: string;
            justifyContent: string;
        };
        "2_10": {
            alignItems: string;
            justifyContent: string;
        };
        "9": {
            alignItems: string;
            justifyContent: string;
        };
        "3": {
            alignItems: string;
            justifyContent: string;
        };
        "3_9": {
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            alignItems: string;
            justifyContent: string;
        };
        "6": {
            alignItems: string;
            justifyContent: string;
        };
        "5": {
            alignItems: string;
            justifyContent: string;
        };
        "5_7": {
            alignItems: string;
            justifyContent: string;
        };
    };
    column: {
        center: {
            flexDirection: "column";
            alignItems: string;
            justifyContent: string;
        };
        "7": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "2": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "7_10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "9": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "3": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6_12": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "10": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "6": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
        "1_5": {
            flexDirection: "column";
            justifyContent: string;
            alignItems: string;
        };
    };
    north: {
        true: {
            top: string;
        };
    };
    east: {
        true: {
            right: string;
        };
    };
    south: {
        true: {
            bottom: string;
        };
    };
    west: {
        true: {
            left: string;
        };
    };
    north_east: {
        true: {
            top: string;
            right: string;
        };
    };
    south_east: {
        true: {
            bottom: string;
            right: string;
        };
    };
    south_west: {
        true: {
            bottom: string;
            left: string;
        };
    };
    north_west: {
        true: {
            top: string;
            left: string;
        };
    };
}>;
export declare const gradient: import("@vanilla-extract/recipes").RuntimeFn<{
    purple: {
        background: string;
    };
}>;
