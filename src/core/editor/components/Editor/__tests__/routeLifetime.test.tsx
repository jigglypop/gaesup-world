import { StrictMode, useLayoutEffect } from 'react';
import { render } from '@testing-library/react';
import { useGaesupStore } from '../../../../stores/gaesupStore';
import { Editor } from '..';

jest.mock('../../EditorLayout', () => ({ EditorLayout: () => null }));

function WorldRoute() {
  useLayoutEffect(() => {
    const store = useGaesupStore.getState();
    store.setMode({ type: 'character', controller: 'keyboard', control: 'thirdPerson' });
    store.setCameraOption({ xDistance: 9, yDistance: 7, zDistance: 9, zoom: 1 });
  }, []);
  return null;
}

test('outgoing editor cannot restore its snapshot over the incoming world', () => {
  const store = useGaesupStore.getState();
  store.setMode({ type: 'character', controller: 'clicker', control: 'topDown' });
  store.setCameraOption({ xDistance: 0, yDistance: 52, zDistance: 0, zoom: 0.4 });
  const view = render(<StrictMode><Editor /></StrictMode>);
  view.rerender(<StrictMode><WorldRoute /></StrictMode>);
  expect(useGaesupStore.getState().mode).toEqual({ type: 'character', controller: 'keyboard', control: 'thirdPerson' });
  expect(useGaesupStore.getState().cameraOption).toEqual(expect.objectContaining({ xDistance: 9, yDistance: 7, zDistance: 9, zoom: 1 }));
  view.unmount();
});
