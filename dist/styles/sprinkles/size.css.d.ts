export declare const sizeProperties: {
    conditions: {
        defaultCondition: "mobile";
        conditionNames: ("mobile" | "tablet" | "laptop" | "desktop")[];
    };
    styles: {
        width: {
            values: {
                [x: string]: {
                    defaultClass: string;
                    conditions: {
                        mobile: string;
                        tablet: string;
                        laptop: string;
                        desktop: string;
                    };
                };
            };
        };
        height: {
            values: {
                [x: string]: {
                    defaultClass: string;
                    conditions: {
                        mobile: string;
                        tablet: string;
                        laptop: string;
                        desktop: string;
                    };
                };
            };
        };
    };
} & {
    styles: {
        w: {
            mappings: "width"[];
        };
        h: {
            mappings: "height"[];
        };
    };
};
