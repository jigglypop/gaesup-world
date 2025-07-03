export interface FSMState {
    onEnter?: {
        action: string;
        args?: any[];
    }[] | undefined;
    onUpdate?: {
        action: string;
        args?: any[];
    }[] | undefined;
    onExit?: {
        action: string;
        args?: any[];
    }[] | undefined;
    transitions?: {
        to: string;
        condition: string;
    }[] | undefined;
}
export interface CompiledFSM {
    initialState: string;
    states: Record<string, FSMState>;
}
export declare function compileFSMGraph(nodes: any[], edges: any[]): CompiledFSM;
export declare function validateFSM(fsm: CompiledFSM): string[];
