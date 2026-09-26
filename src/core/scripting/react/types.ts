import type { EditorPlayMode } from '../../editor/playMode';
import type { FrameScheduler } from '../../runtime/frame/FrameScheduler';
import type { SceneDocumentController } from '../../scene-object/types';
import type { ScriptServiceLocator } from '../types';

export type ScriptPlayMode = EditorPlayMode;

/** Where scripts read edit, play and pause from; an `EditorPlayModeController` is one. */
export type ScriptPlayModeSource = {
  getState: () => { mode: ScriptPlayMode };
  subscribe: (listener: () => void) => () => void;
};

export type UseScriptRuntimeOptions = {
  controller: SceneDocumentController;
  services?: ScriptServiceLocator;
  active?: boolean;
  playMode?: ScriptPlayModeSource;
  scheduler?: FrameScheduler;
};

export type ScriptRuntimeHostProps = UseScriptRuntimeOptions;
