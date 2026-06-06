export type EditorPlayMode = 'edit' | 'play' | 'paused';

export interface EditorPlayModeSnapshot<TSnapshot = unknown> {
  id: string;
  createdAt: number;
  data: TSnapshot;
}

export interface EditorPlayModeState<TSnapshot = unknown> {
  mode: EditorPlayMode;
  snapshot?: EditorPlayModeSnapshot<TSnapshot>;
}

export type EditorPlayModeListener<TSnapshot = unknown> = (
  state: EditorPlayModeState<TSnapshot>,
) => void;

export interface EditorPlayModeController<TSnapshot = unknown> {
  getState: () => EditorPlayModeState<TSnapshot>;
  enter: () => Promise<EditorPlayModeSnapshot<TSnapshot>>;
  exit: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  toggle: () => Promise<void>;
  subscribe: (listener: EditorPlayModeListener<TSnapshot>) => () => void;
}

export interface CreateEditorPlayModeControllerOptions<TSnapshot> {
  createSnapshot: () => TSnapshot | Promise<TSnapshot>;
  restoreSnapshot: (snapshot: TSnapshot) => void | Promise<void>;
  onEnter?: (snapshot: EditorPlayModeSnapshot<TSnapshot>) => void | Promise<void>;
  onExit?: (snapshot: EditorPlayModeSnapshot<TSnapshot>) => void | Promise<void>;
}

let playModeSnapshotCounter = 0;

export function createEditorPlayModeController<TSnapshot>(
  options: CreateEditorPlayModeControllerOptions<TSnapshot>,
): EditorPlayModeController<TSnapshot> {
  let state: EditorPlayModeState<TSnapshot> = { mode: 'edit' };
  const listeners = new Set<EditorPlayModeListener<TSnapshot>>();

  const setState = (next: EditorPlayModeState<TSnapshot>) => {
    state = next;
    listeners.forEach((listener) => listener(state));
  };
  const controller: EditorPlayModeController<TSnapshot> = {
    getState: () => state,
    enter: async () => {
      if (state.snapshot && state.mode !== 'edit') {
        setState({ ...state, mode: 'play' });
        return state.snapshot;
      }

      const snapshot: EditorPlayModeSnapshot<TSnapshot> = {
        id: `play-snapshot-${++playModeSnapshotCounter}`,
        createdAt: Date.now(),
        data: await options.createSnapshot(),
      };
      setState({ mode: 'play', snapshot });
      await options.onEnter?.(snapshot);
      return snapshot;
    },
    exit: async () => {
      const snapshot = state.snapshot;
      if (!snapshot) {
        setState({ mode: 'edit' });
        return;
      }

      await options.restoreSnapshot(snapshot.data);
      setState({ mode: 'edit' });
      await options.onExit?.(snapshot);
    },
    pause: () => {
      if (state.mode === 'play') {
        setState({ ...state, mode: 'paused' });
      }
    },
    resume: () => {
      if (state.mode === 'paused') {
        setState({ ...state, mode: 'play' });
      }
    },
    toggle: async () => {
      if (state.mode === 'edit') {
        await controller.enter();
        return;
      }
      await controller.exit();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    },
  };
  return controller;
}
