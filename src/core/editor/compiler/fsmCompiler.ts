export interface FSMState {
  onEnter?: { action: string; args?: any[] }[];
  onUpdate?: { action: string; args?: any[] }[];
  onExit?: { action: string; args?: any[] }[];
  transitions?: { to: string; condition: string }[];
}

export interface CompiledFSM {
  initialState: string;
  states: Record<string, FSMState>;
}

export function compileFSMGraph(nodes: any[], edges: any[]): CompiledFSM {
  const stateNodes = nodes.filter(node => node.type !== 'input');
  const initialNode = nodes.find(node => node.type === 'input');
  
  if (!initialNode) {
    throw new Error('FSM must have an initial state node');
  }

  const initialStateEdge = edges.find(edge => edge.source === initialNode.id);
  const initialState = initialStateEdge ? 
    stateNodes.find(node => node.id === initialStateEdge.target)?.data.label || 'idle' : 
    'idle';

  const states: Record<string, FSMState> = {};

  stateNodes.forEach(node => {
    const stateName = node.data.label.toLowerCase().replace(' state', '');
    const stateTransitions = edges
      .filter(edge => edge.source === node.id)
      .map(edge => {
        const targetNode = stateNodes.find(n => n.id === edge.target);
        const targetStateName = targetNode?.data.label.toLowerCase().replace(' state', '') || 'unknown';
        
        return {
          to: targetStateName,
          condition: edge.data?.condition || `isConditionMet("${targetStateName}")`
        };
      });

    states[stateName] = {
      onEnter: [{ action: 'playAnimation', args: [`${stateName}_anim`] }],
      transitions: stateTransitions.length > 0 ? stateTransitions : undefined
    };
  });

  return {
    initialState: initialState.toLowerCase().replace(' state', ''),
    states
  };
}

export function validateFSM(fsm: CompiledFSM): string[] {
  const errors: string[] = [];
  
  if (!fsm.states[fsm.initialState]) {
    errors.push(`Initial state "${fsm.initialState}" not found in states`);
  }

  Object.entries(fsm.states).forEach(([stateName, state]) => {
    state.transitions?.forEach(transition => {
      if (!fsm.states[transition.to]) {
        errors.push(`Transition target "${transition.to}" from state "${stateName}" not found`);
      }
    });
  });

  return errors;
} 