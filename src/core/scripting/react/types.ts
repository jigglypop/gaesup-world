import type { FrameScheduler } from '../../runtime/frame/FrameScheduler';
import type { SceneDocumentController } from '../../scene-object/types';
import type { ScriptServiceLocator } from '../types';

export type UseScriptRuntimeOptions = {
  controller: SceneDocumentController;
  services?: ScriptServiceLocator;
  active?: boolean;
  scheduler?: FrameScheduler;
};

export type ScriptRuntimeHostProps = UseScriptRuntimeOptions;
