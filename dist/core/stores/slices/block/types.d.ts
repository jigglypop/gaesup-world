export interface BlockState {
    camera: boolean;
    control: boolean;
    animation: boolean;
    scroll: boolean;
}
export interface BlockSlice {
    block: BlockState;
    setBlock: (update: Partial<BlockState>) => void;
}
