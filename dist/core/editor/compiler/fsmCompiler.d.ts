export interface FSMState {
    onEnter?: {
        action: string;
        args?: any[];
    }[];
    onUpdate?: {
        action: string;
        args?: any[];
    }[];
    onExit?: {
        action: string;
        args?: any[];
    }[];
    transitions?: {
        to: string;
        condition: string;
    }[];
}
export interface CompiledFSM {
    initialState: string;
    states: Record<string, FSMState>;
}
export declare function compileFSMGraph(nodes: any[], edges: any[]): CompiledFSM;
export declare function validateFSM(fsm: CompiledFSM): string[];
