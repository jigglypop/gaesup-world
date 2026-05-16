type SandProps = {
    size?: number;
    toon?: boolean;
    color?: string;
    accentColor?: string;
};
export type SandEntry = {
    position: [number, number, number];
    size: number;
    color?: string;
    accentColor?: string;
};
export declare function SandBatch({ entries, toon }: {
    entries: SandEntry[];
    toon?: boolean;
}): import("react").JSX.Element | null;
export default function Sand({ size, toon, color: sandColor, accentColor: sandAccentColor }: SandProps): import("react").JSX.Element;
export {};
