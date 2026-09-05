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
  const prepareHydrate: NonNullable<DomainBinding['prepareHydrate']> = (data) => {
    if (data === null || data === undefined) return () => {};

    const migrated = migrateSceneDocument(data, ownedMigrations);
    if (!migrated.ok || !migrated.document) {
      throw new TypeError(formatSceneDocumentIssues(migrated.issues));
    }

    const document = migrated.document;
    return () => {
      const result = controller.dispatch({
        type: 'scene-document.replace',
        document,
      });
      if (!result.accepted) {
        throw new TypeError(formatSceneDocumentIssues(result.issues));
      }
    };
  };

  return {
    key: SCENE_DOCUMENT_SAVE_KEY,
    serialize: () => cloneSceneDocument(controller.getSnapshot()),
    prepareHydrate,
    hydrate: (data) => prepareHydrate(data)(),
  };
}

function formatSceneDocumentIssues(issues: readonly { message: string }[]): string {
  return issues.map((issue) => issue.message).join(' ') || 'Scene document is invalid.';
}
