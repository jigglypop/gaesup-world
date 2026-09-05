import { fireEvent, render } from '@testing-library/react';

import { CatalogUI } from '../../catalog/components/CatalogUI';
import { InventoryUI } from '../../inventory/components/InventoryUI';
import { MailboxUI } from '../../mail/components/MailboxUI';
import { QuestLogUI } from '../../quests/components/QuestLogUI';

test.each([
  { Component: CatalogUI, key: 'k' },
  { Component: InventoryUI, key: 'i' },
  { Component: MailboxUI, key: 'm' },
  { Component: QuestLogUI, key: 'j' },
])('$key opens once and ignores text editing, composition and modified keys', ({ Component, key }) => {
  const view = render(<><Component /><select><option>Option</option></select><div contentEditable suppressContentEditableWarning><span>Edit</span></div></>);
  const panel = () => view.container.querySelector('[data-world-overlay]');
  for (const flags of [{ repeat: true }, { isComposing: true }, { ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
    fireEvent.keyDown(window, { key, ...flags });
    expect(panel()).toBeNull();
  }
  fireEvent.keyDown(view.container.querySelector('select')!, { key });
  fireEvent.keyDown(view.getByText('Edit'), { key });
  const consumed = new KeyboardEvent('keydown', { key, cancelable: true });
  consumed.preventDefault();
  fireEvent(window, consumed);
  expect(panel()).toBeNull();
  fireEvent.keyDown(window, { key });
  expect(panel()).not.toBeNull();
  fireEvent.keyDown(window, { key, repeat: true });
  expect(panel()).not.toBeNull();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(panel()).toBeNull();
});
