type WaterProps = {
    lod?: {
        near?: number;
        far?: number;
        strength?: number;
    };
    center?: [number, number, number];
    size?: number;
    width?: number;
    depth?: number;
    shore?: Partial<{
        north: boolean;
        south: boolean;
        east: boolean;
        west: boolean;
    }>;
    /**
     * When true, uses a lightweight stylized shader without reflection RT.
     * Defaults to the global toon mode. The normal path keeps the original Water quality.
     */
    toon?: boolean;
};
export default function Ocean({ lod, center, size, width, depth, shore, toon }: WaterProps): import("react").JSX.Element;
export {};
