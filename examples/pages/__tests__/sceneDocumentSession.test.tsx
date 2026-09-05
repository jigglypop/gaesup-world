import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import { SaveSystem, createContentBundleFromSaveSystem, logger, type SaveAdapter, type SaveBlob } from 'gaesup-world';
import { InspectorPanel } from 'gaesup-world/editor';

import { createWorldRuntime, loadWorldRuntime } from '../runtime';
import {
  WORLD_SCENE_DOCUMENT_SAVE_KEY,
  createWorldSceneDocumentSession,
  getWorldSceneDocumentSession,
  projectWorldSceneDocumentRootMarkers,
  resetWorldSceneDocumentSession,
  useWorldSceneDocumentSnapshot,
  type WorldSceneDocumentSession,
} from '../world/sceneDocument';

class MemorySaveAdapter implements SaveAdapter {
  private readonly blobs = new Map<string, SaveBlob>();
  private readonly readFailures: unknown[] = [];
  public readCount = 0;

  public async read(slot: string): Promise<SaveBlob | null> {
    this.readCount += 1;
    const failure = this.readFailures.shift();
    if (failure !== undefined) throw failure;
    return this.blobs.get(slot) ?? null;
  }

  public async write(slot: string, blob: SaveBlob): Promise<void> {
    this.blobs.set(slot, blob);
  }

  public async list(): Promise<string[]> {
    return [...this.blobs.keys()];
  }

  public async remove(slot: string): Promise<void> {
    this.blobs.delete(slot);
  }

  public failNextRead(error: unknown): void {
    this.readFailures.push(error);
  }
}

function SnapshotProbe({ session }: { session: WorldSceneDocumentSession }) {
  const document = useWorldSceneDocumentSnapshot(session);
  return (
    <output data-testid="scene-snapshot">
      {document.objects.map((object) => object.name).join('|')}
    </output>
  );
}

describe('world scene document session', () => {
  test('commits inspector drafts through the real scene command path without repeated mutations', async () => {
    const session = createWorldSceneDocumentSession();
    const changed = jest.fn();
    const unsubscribe = session.subscribe(changed);
    function InspectorProbe() {
      const document = useWorldSceneDocumentSnapshot(session);
      return <InspectorPanel sceneDocument={document} selectedObjectId="world-origin-marker"
        onUpdateObject={(id, patch) => { void session.updateObject(id, patch); }} />;
    }
    try {
      const view = render(<InspectorProbe />);
      const position = screen.getByLabelText('위치 X');
      fireEvent.change(position, { target: { value: '' } });
      fireEvent.blur(position);
      expect(changed).not.toHaveBeenCalled();
      expect(position).toHaveValue(8);
      for (const [label, value] of [
        ['위치 X', '-2.75'], ['태그', 'example, forest, '], ['회전 (라디안) Y', '1.57'],
      ] as const) {
        const input = screen.getByLabelText(label);
        await act(async () => {
          input.focus();
          fireEvent.change(input, { target: { value } });
          fireEvent.keyDown(input, { key: 'Enter' });
        });
      }
      expect(changed).toHaveBeenCalledTimes(3);
      expect(session.getSnapshot().objects[0]).toMatchObject({
        tags: ['example', 'forest'],
        transform: { position: [-2.75, 1, -6], rotation: [0, 1.57, 0] },
      });
      view.unmount();
      render(<InspectorProbe />);
      expect(screen.getByLabelText('위치 X')).toHaveValue(-2.75);
      expect(screen.getByLabelText('태그')).toHaveValue('example, forest');
      expect(screen.getByLabelText('회전 (라디안) Y')).toHaveValue(1.57);
      expect(changed).toHaveBeenCalledTimes(3);
    } finally {
      unsubscribe();
    }
  });

  test('includes creator edits in exported world bundles', async () => {
    const session = createWorldSceneDocumentSession();
    const saveSystem = new SaveSystem({ adapter: new MemorySaveAdapter() });
    const runtime = createWorldRuntime({ saveSystem, sceneDocumentSession: session });
    try {
      await runtime.setup();
      expect(await session.createObject({ id: 'exported-object', name: '내보낼 오브젝트' })).toBe(true);
      const bundle = createContentBundleFromSaveSystem(saveSystem, [], {
        id: 'creator-world', name: '제작 월드', version: '1.0.0',
      });
      expect(bundle.world.domains[WORLD_SCENE_DOCUMENT_SAVE_KEY]).toEqual(session.getSnapshot());
    } finally {
      await runtime.dispose();
    }
  });

  afterEach(() => {
    cleanup();
    resetWorldSceneDocumentSession();
    jest.restoreAllMocks();
  });

  test('provides an explicit singleton reset seam with stable snapshots', async () => {
    const first = resetWorldSceneDocumentSession();
    const initialSnapshot = first.getSnapshot();

    expect(getWorldSceneDocumentSession()).toBe(first);
    expect(first.getSnapshot()).toBe(initialSnapshot);
    expect(await first.updateObject('world-origin-marker', { name: 'Updated marker' })).toBe(true);
    expect(first.getSnapshot()).not.toBe(initialSnapshot);

    const second = resetWorldSceneDocumentSession();
    expect(second).not.toBe(first);
    expect(getWorldSceneDocumentSession()).toBe(second);
    expect(second.getSnapshot().objects[0]?.name).toBe('월드 기준 표식');
  });

  test('routes editor operations through one subscribed canonical snapshot', async () => {
    const session = createWorldSceneDocumentSession();
    const snapshots: SaveBlob['domains'][] = [];
    const unsubscribe = session.subscribe(() => {
      snapshots.push({ scene: session.getSnapshot() });
    });

    expect(
      await session.createObject({
        id: 'created-root',
        name: 'Created root',
        transform: { position: [3, 2, 1] },
      }),
    ).toBe(true);
    expect(
      await session.createObject({
        id: 'created-child',
        name: 'Created child',
        parentId: 'created-root',
      }),
    ).toBe(true);
    expect(await session.moveObject('created-child', undefined)).toBe(true);
    expect(
      session.getSnapshot().objects.find((object) => object.id === 'created-child')?.parentId,
    ).toBeUndefined();
    expect(await session.moveObject('created-child', 'created-root')).toBe(true);
    expect(await session.updateObject('created-root', { name: 'Renamed root' })).toBe(true);
    expect(
      await session.addComponent('created-root', {
        id: 'created-component',
        type: 'example.marker',
        data: { visible: true },
      }),
    ).toBe(true);
    expect(await session.removeComponent('created-root', 'created-component')).toBe(true);
    expect(await session.deleteObject('created-root')).toBe(true);

    expect(session.getSnapshot().objects.some((object) => object.id === 'created-root')).toBe(
      false,
    );
    expect(session.getSnapshot().objects.some((object) => object.id === 'created-child')).toBe(
      false,
    );
    expect(snapshots).toHaveLength(8);
    unsubscribe();
  });

  test('handles rejected editor commands without changing identity or leaking a rejection', async () => {
    const session = createWorldSceneDocumentSession();
    const initialSnapshot = session.getSnapshot();
    const loggerError = jest.spyOn(logger, 'error').mockImplementation(() => {
      throw new Error('logger failed');
    });

    await expect(session.deleteObject('missing-object')).resolves.toBe(false);

    expect(session.getSnapshot()).toBe(initialSnapshot);
    expect(loggerError).toHaveBeenCalledWith(
      '[WorldSceneDocument] Delete missing-object rejected.',
      expect.any(Error),
    );
  });

  test('normalizes a synchronous command factory failure to a handled false result', async () => {
    const session = createWorldSceneDocumentSession();
    const initialSnapshot = session.getSnapshot();
    const loggerError = jest.spyOn(logger, 'error').mockImplementation(() => undefined);

    const result = session.createObject({
      id: 'invalid-object',
      name: 'Invalid object',
      components: [{ type: '' }],
    });

    await expect(result).resolves.toBe(false);
    expect(session.getSnapshot()).toBe(initialSnapshot);
    expect(loggerError).toHaveBeenCalledWith(
      '[WorldSceneDocument] Create scene object rejected.',
      expect.any(Error),
    );
  });

  test('projects only loadSceneRuntime roots and updates React subscribers', async () => {
    const session = createWorldSceneDocumentSession();
    const initialMarkers = projectWorldSceneDocumentRootMarkers(session.getSnapshot());

    expect(initialMarkers.map((marker) => marker.id)).toEqual(['world-origin-marker']);
    expect(initialMarkers[0]?.position).toEqual([8, 1, -6]);

    render(<SnapshotProbe session={session} />);
    expect(screen.getByTestId('scene-snapshot').textContent).toContain('월드 기준 표식');
    await act(async () => {
      await session.updateObject('world-origin-marker', { name: 'Live shared marker' });
    });
    expect(screen.getByTestId('scene-snapshot').textContent).toContain('Live shared marker');
  });

  test('registers the scene-document plugin on setup and round-trips the shared controller', async () => {
    const session = resetWorldSceneDocumentSession();
    const saveSystem = new SaveSystem({ adapter: new MemorySaveAdapter() });
    const discardedRuntime = createWorldRuntime({ saveSystem, sceneDocumentSession: session });
    expect(saveSystem.has(WORLD_SCENE_DOCUMENT_SAVE_KEY)).toBe(false);
    await discardedRuntime.dispose();
    expect(saveSystem.has(WORLD_SCENE_DOCUMENT_SAVE_KEY)).toBe(false);

    const runtime = createWorldRuntime({ saveSystem });

    expect(saveSystem.has(WORLD_SCENE_DOCUMENT_SAVE_KEY)).toBe(false);
    try {
      await runtime.setup();
      expect(saveSystem.has(WORLD_SCENE_DOCUMENT_SAVE_KEY)).toBe(true);
      await session.updateObject('world-origin-marker', {
        transform: { position: [11, 2, -4] },
      });
      await saveSystem.save('scene-round-trip');
      expect(saveSystem.createBlob().domains[WORLD_SCENE_DOCUMENT_SAVE_KEY]).toBeDefined();

      await session.updateObject('world-origin-marker', {
        transform: { position: [30, 5, 12] },
      });
      await saveSystem.load('scene-round-trip');

      expect(session.getSnapshot().objects[0]?.transform.position).toEqual([11, 2, -4]);
    } finally {
      await runtime.dispose();
    }
    expect(saveSystem.has(WORLD_SCENE_DOCUMENT_SAVE_KEY)).toBe(false);
  });

  test('hydrates a SaveSystem once so route remounts preserve newer in-memory edits', async () => {
    const session = createWorldSceneDocumentSession();
    const adapter = new MemorySaveAdapter();
    const saveSystem = new SaveSystem({ adapter });
    const firstRuntime = createWorldRuntime({ saveSystem, sceneDocumentSession: session });

    await firstRuntime.setup();
    await session.updateObject('world-origin-marker', { name: 'Saved marker' });
    await saveSystem.save();
    await session.updateObject('world-origin-marker', { name: 'Before initial hydration' });
    await loadWorldRuntime(firstRuntime);
    expect(session.getSnapshot().objects[0]?.name).toBe('Saved marker');
    await session.updateObject('world-origin-marker', { name: 'Unsaved live marker' });
    await firstRuntime.dispose();

    const secondRuntime = createWorldRuntime({ saveSystem, sceneDocumentSession: session });
    try {
      await loadWorldRuntime(secondRuntime);
      expect(session.getSnapshot().objects[0]?.name).toBe('Unsaved live marker');
      expect(adapter.readCount).toBe(1);
    } finally {
      await secondRuntime.dispose();
    }
  });

  test('deduplicates concurrent initial hydration and retries after a read rejection', async () => {
    const session = createWorldSceneDocumentSession();
    const adapter = new MemorySaveAdapter();
    const saveSystem = new SaveSystem({ adapter });
    const runtime = createWorldRuntime({ saveSystem, sceneDocumentSession: session });

    adapter.failNextRead(new Error('initial read failed'));
    await expect(loadWorldRuntime(runtime)).rejects.toThrow('initial read failed');
    await expect(
      Promise.all([loadWorldRuntime(runtime), loadWorldRuntime(runtime)]),
    ).resolves.toEqual([false, false]);
    expect(adapter.readCount).toBe(2);

    await runtime.dispose();
  });
});
