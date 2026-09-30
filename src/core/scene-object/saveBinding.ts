import { migrateSceneDocument } from './migration';
import type { SceneMigration } from './migration';
import { deepFreezeOwned } from './ownership';
import { cloneSceneDocument } from './serialization';
import { isTrustedSceneSnapshot, trustSceneSnapshot } from './trustedSnapshots';
import type { SceneDocumentController } from './types';
import { createIdentityRevision } from '../save/core/revision';
import type { DomainBinding } from '../save/types';
import { clonePlainData } from '../utils/clone';

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

    // The fresh parse is validated and owned here, so the replace command does not validate it again.
    const document = trustSceneSnapshot(deepFreezeOwned(migrated.document));
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
    serialize: () => {
      const snapshot = controller.getSnapshot();
      // Trusted snapshots are validated and deep-frozen: one plain copy is the whole cost.
      return isTrustedSceneSnapshot(snapshot) ? clonePlainData(snapshot) : cloneSceneDocument(snapshot);
    },
    owned: true,
    // Untrusted snapshots may change in place, so they always read as changed.
    revision: createIdentityRevision(() => {
      const snapshot = controller.getSnapshot();
      return [isTrustedSceneSnapshot(snapshot) ? snapshot : {}];
    }),
    prepareHydrate,
    hydrate: (data) => prepareHydrate(data)(),
  };
}

function formatSceneDocumentIssues(issues: readonly { message: string }[]): string {
  return issues.map((issue) => issue.message).join(' ') || 'Scene document is invalid.';
}
