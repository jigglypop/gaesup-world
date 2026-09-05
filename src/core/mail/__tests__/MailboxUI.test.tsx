import { fireEvent, render, screen, within } from '@testing-library/react';

import { MailboxUI } from '../components/MailboxUI';
import { useMailStore } from '../stores/mailStore';

test('mail entries are selectable buttons and deletion returns to the list guidance', () => {
  useMailStore.setState({ messages: [{
    id: 'mail-ui', from: '메이', subject: '마을 소식', body: '오늘도 좋은 하루 보내세요.',
    sentDay: 1, read: false, claimed: true,
  }] });
  render(<MailboxUI />);
  fireEvent.keyDown(window, { key: 'm' });
  const panel = screen.getByRole('region', { name: '우편함' });
  const entry = within(panel).getByRole('button', { name: /마을 소식/ });
  expect(entry).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(entry);
  expect(entry).toHaveAttribute('aria-pressed', 'true');
  expect(within(panel).getByText('오늘도 좋은 하루 보내세요.')).toBeInTheDocument();
  expect(useMailStore.getState().messages[0]?.read).toBe(true);
  fireEvent.click(within(panel).getByRole('button', { name: '삭제', exact: true }));
  expect(within(panel).getByText('우편이 없습니다.')).toBeInTheDocument();
  expect(within(panel).getByText('목록에서 읽을 우편을 선택하세요.')).toBeInTheDocument();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(screen.queryByRole('region', { name: '우편함' })).not.toBeInTheDocument();
});
