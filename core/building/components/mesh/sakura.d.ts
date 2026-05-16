import type { BuildingTreeKind } from '../../types';
type SakuraProps = {
    size?: number;
    toon?: boolean;
};
export type SakuraTreeEntry = {
    position: [number, number, number];
    size: number;
    treeKind?: BuildingTreeKind;
    blossomColor?: string;
    barkColor?: string;
};
export declare function SakuraBatch({ trees, toon }: {
    trees: SakuraTreeEntry[];
    toon?: boolean;
}): import("react").JSX.Element | null;
export default function Sakura({ size, toon }: SakuraProps): import("react").JSX.Element;
export {};
