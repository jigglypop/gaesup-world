import { applySceneDocumentCommand } from './commands';
import { deepFreezeOwned } from './ownership';
import { parseSceneDocument } from './serialization';
import type {
  SceneDocument,
  SceneDocumentController,
  SceneDocumentControllerListener,
  SceneDocumentEvent,
} from './types';
import { logger } from '../utils/logger';

type SceneDocumentListenerRegistration = {
  listener: SceneDocumentControllerListener;
};

type SceneDocumentNotification = {
  snapshot: SceneDocument;
  event: SceneDocumentEvent;
};

export function createSceneDocumentController(
  initialDocument: SceneDocument,
): SceneDocumentController {
  const parsed = parseSceneDocument(initialDocument);
  if (!parsed.ok || !parsed.document) {
    throw new TypeError(formatSceneDocumentIssues(parsed.issues));
  }

  let snapshot = deepFreezeOwned(parsed.document);
  const listeners = new Map<SceneDocumentControllerListener, SceneDocumentListenerRegistration>();
  const notificationQueue: SceneDocumentNotification[] = [];
  let isNotifying = false;

  const notify = (notification: SceneDocumentNotification): void => {
    notificationQueue.push(notification);
    if (isNotifying) return;

    isNotifying = true;
    try {
      for (let index = 0; index < notificationQueue.length; index++) {
        const current = notificationQueue[index];
        if (!current) continue;
        const registrations = [...listeners.values()];
        for (const registration of registrations) {
          try {
            registration.listener(current.snapshot, current.event);
          } catch (error) {
            reportListenerFailure(error);
          }
        }
      }
    } finally {
      notificationQueue.length = 0;
      isNotifying = false;
    }
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      const registration = { listener };
      listeners.set(listener, registration);
      return () => {
        if (listeners.get(listener) === registration) {
          listeners.delete(listener);
        }
      };
    },
    dispatch: (command) => {
      const result = applySceneDocumentCommand(snapshot, command);
      if (!result.accepted) return result;

      snapshot = result.document;
      notify({ snapshot: result.document, event: result.event });
      return result;
    },
  };
}

function reportListenerFailure(error: unknown): void {
  try {
    logger.error(
      'Scene document controller listener failed.',
      error instanceof Error ? error : String(error),
    );
  } catch {
    // Diagnostics must not interrupt state publication or later observers.
  }
}

function formatSceneDocumentIssues(issues: readonly { message: string }[]): string {
  return issues.map((issue) => issue.message).join(' ') || 'Scene document is invalid.';
}
