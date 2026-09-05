import React from 'react';

import { act, cleanup, render } from '@testing-library/react';

import { Editor } from 'gaesup-world/editor';

import { createWorldSceneDocumentSession } from '../world/sceneDocument';
import { WorldEditorSurface } from '../WorldEditorSurface';

jest.mock('gaesup-world/editor', () => {
  const actual = jest.requireActual('gaesup-world/editor') as object;
  const editorState: { props: unknown } = { props: null };
  return {
    ...actual,
    __editorState: editorState,
    Editor: (props: unknown) => {
      editorState.props = props;
      return null;
    },
  };
});

type CapturedEditorProps = React.ComponentProps<typeof Editor>;
type EditorMockState = { props: CapturedEditorProps | null };

const editorState = (jest.requireMock('gaesup-world/editor') as { __editorState: EditorMockState })
  .__editorState;

function getEditorProps(): CapturedEditorProps {
  if (!editorState.props) throw new Error('Editor props were not captured.');
  return editorState.props;
}

async function flushEditorTask(run: () => void | Promise<void>): Promise<void> {
  await act(async () => {
    await run();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('WorldEditorSurface scene document wiring', () => {
  afterEach(() => {
    cleanup();
    editorState.props = null;
    jest.restoreAllMocks();
  });

  test('projects one controlled session through editor selection and canonical operations', async () => {
    const session = createWorldSceneDocumentSession();
    const customCommand = { id: 'custom-command', label: 'Custom command', run: jest.fn() };

    const view = render(
      <WorldEditorSurface
        showEditorShell
        includeEditorAuxPanels={false}
        editorShellOptions={{ commands: [customCommand] }}
        sceneDocumentSession={session}
      />,
    );

    let props = getEditorProps();
    expect(props.sceneDocument).toBe(session.getSnapshot());
    expect(props.projectScenes).toEqual([session.getSnapshot()]);
    expect(props.selectedObjectId).toBe('world-origin-marker');
    expect(props.shell?.actions.map((action) => action.id)).toEqual(
      expect.arrayContaining([
        'example.scene-document.create-marker',
        'example.scene-document.delete-selected',
        'custom-command',
      ]),
    );

    const nestedObject = session
      .getSnapshot()
      .objects.find((object) => object.id === 'world-origin-marker-detail');
    if (!nestedObject) throw new Error('Expected the initial nested scene object.');
    act(() => {
      props.onSelectSceneObject?.(nestedObject);
    });
    props = getEditorProps();
    expect(props.selectedObjectId).toBe(nestedObject.id);

    await flushEditorTask(() => {
      props.onUpdateSceneObject?.(nestedObject.id, { name: 'Edited nested detail' });
    });
    expect(
      session.getSnapshot().objects.find((object) => object.id === nestedObject.id)?.name,
    ).toBe('Edited nested detail');

    await flushEditorTask(() => {
      getEditorProps().onAddSceneComponent?.(nestedObject.id, {
        id: 'editor-component',
        type: 'example.editor-component',
        data: { enabledByEditor: true },
      });
    });
    expect(
      session
        .getSnapshot()
        .objects.find((object) => object.id === nestedObject.id)
        ?.components.some((component) => component.id === 'editor-component'),
    ).toBe(true);

    await flushEditorTask(() => {
      getEditorProps().onRemoveSceneComponent?.(nestedObject.id, 'editor-component');
    });
    expect(
      session
        .getSnapshot()
        .objects.find((object) => object.id === nestedObject.id)
        ?.components.some((component) => component.id === 'editor-component'),
    ).toBe(false);

    await act(async () => {
      await session.deleteObject(nestedObject.id);
    });
    expect(getEditorProps().selectedObjectId).toBe('world-origin-marker');

    const createAction = getEditorProps().shell?.actions.find(
      (action) => action.id === 'example.scene-document.create-marker',
    );
    if (!createAction) throw new Error('Expected the create marker editor action.');
    await flushEditorTask(createAction.onClick);
    expect(session.getSnapshot().objects.some((object) => object.id === 'creator-marker-1')).toBe(
      true,
    );
    expect(getEditorProps().selectedObjectId).toBe('creator-marker-1');

    const deleteAction = getEditorProps().shell?.actions.find(
      (action) => action.id === 'example.scene-document.delete-selected',
    );
    if (!deleteAction) throw new Error('Expected the delete marker editor action.');
    await flushEditorTask(deleteAction.onClick);
    expect(session.getSnapshot().objects.some((object) => object.id === 'creator-marker-1')).toBe(
      false,
    );
    expect(getEditorProps().selectedObjectId).toBe('world-origin-marker');
    expect(getEditorProps().sceneDocument).toBe(session.getSnapshot());

    view.unmount();
  });

  test('releases the external-store subscription with the editor React lifetime', () => {
    const session = createWorldSceneDocumentSession();
    const originalSubscribe = session.subscribe;
    let unsubscribeCount = 0;
    const subscribe = jest.spyOn(session, 'subscribe').mockImplementation((listener) => {
      const unsubscribe = originalSubscribe(listener);
      return () => {
        unsubscribeCount += 1;
        unsubscribe();
      };
    });

    const view = render(
      <WorldEditorSurface
        showEditorShell
        includeEditorAuxPanels={false}
        editorShellOptions={{}}
        sceneDocumentSession={session}
      />,
    );
    expect(subscribe).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(unsubscribeCount).toBe(1);
  });
});
