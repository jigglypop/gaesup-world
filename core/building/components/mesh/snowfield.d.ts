type SnowfieldProps = {
    size?: number;
    toon?: boolean;
    color?: string;
    accentColor?: string;
};
export type SnowfieldEntry = {
    position: [number, number, number];
    size: number;
    color?: string;
    accentColor?: string;
};
export declare function SnowfieldBatch({ entries, toon }: {
    entries: SnowfieldEntry[];
    toon?: boolean;
}): import("react").JSX.Element | null;
export default function Snowfield({ size, toon, color: snowColor, accentColor: snowAccentColor }: SnowfieldProps): import("react").JSX.Element;
export {};
