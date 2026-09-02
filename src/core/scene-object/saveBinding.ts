import { migrateSceneDocument } from './migration';
import type { SceneMigration } from './migration';
import { cloneSceneDocument } from './serialization';
import type { SceneDocumentController } from './types';
import type { DomainBinding } from '../save/types';

export const SCENE_DOCUMENT_SAVE_KEY = 'scene-document';

export function createSceneDocumentSaveBinding(
  controller: Pick<SceneDocumentController, 'getSnapshot' | 'dispatch'>,
  migrations: readonly SceneMigration[] = [],
): DomainBinding {
  const ownedMigrations = migrations.map((migration) => ({ ...migration }));

  return {
    key: SCENE_DOCUMENT_SAVE_KEY,
    serialize: () => cloneSceneDocument(controller.getSnapshot()),
    hydrate: (data) => {
      if (data === null || data === undefined) return;

      const migrated = migrateSceneDocument(data, ownedMigrations);
      if (!migrated.ok || !migrated.document) {
        throw new TypeError(formatSceneDocumentIssues(migrated.issues));
      }

      const result = controller.dispatch({
        type: 'scene-document.replace',
        document: migrated.document,
      });
      if (!result.accepted) {
        throw new TypeError(formatSceneDocumentIssues(result.issues));
      }
    },
  };
}

function formatSceneDocumentIssues(issues: readonly { message: string }[]): string {
  return issues.map((issue) => issue.message).join(' ') || 'Scene document is invalid.';
}
