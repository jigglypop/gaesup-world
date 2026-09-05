const { chromium, expect } = require('@playwright/test');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    const chats = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.routeWebSocket('ws://localhost:8090', (socket) => {
      socket.onMessage((raw) => {
        const message = JSON.parse(String(raw));
        if (message.type === 'Join') socket.send(JSON.stringify({
          type: 'Welcome', client_id: 'panel-probe-local', room_state: {
            'panel-probe-remote': {
              name: '긴이름검증'.repeat(8), color: '#aabbcc', position: [0, 0, 0],
              rotation: [1, 0, 0, 0], animation: 'idle',
            },
          },
        }));
        if (message.type === 'Chat') chats.push(message.text);
        if (message.ackId) socket.send(JSON.stringify({ type: 'Ack', ackId: message.ackId }));
      });
    });
    await page.goto('http://127.0.0.1:5173/multiplayer');
    await expect(page.getByRole('form', { name: '함께 플레이하기' })).toBeVisible();
    await page.getByLabel('플레이어 이름', { exact: true }).fill('패널 검증');
    await page.getByRole('button', { name: '방에 입장하기' }).click();
    const title = page.getByRole('heading', { name: '함께 플레이 중' });
    await expect(title).toBeVisible();
    const panel = title.locator('..');
    const input = page.getByRole('textbox', { name: '채팅 메시지' });
    for (const [width, height] of [[390, 844], [320, 568], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await expect.poll(async () => {
        const box = await panel.boundingBox();
        const menu = await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox();
        return Boolean(box && menu && box.x >= 0 && box.x + box.width <= width
          && box.y >= menu.y + menu.height && box.y + box.height <= height);
      }, { timeout: 30000 }).toBe(true);
      const box = await panel.boundingBox();
      const menu = await page.getByRole('navigation', { name: '주 메뉴' }).boundingBox();
      if (box.x < 0 || box.x + box.width > width || box.y < menu.y + menu.height || box.y + box.height > height) {
        throw Error(`Panel overlaps or overflows: ${JSON.stringify({ width, box, menu })}`);
      }
      await expect(page.getByRole('button', { name: '연결 끊기' })).toBeInViewport();
      await expect(panel.getByText('idle', { exact: true })).not.toBeVisible();
      await page.screenshot({ path: path.join(os.tmpdir(), `gaesup-player-panel-${width}.png`) });
      console.log(JSON.stringify({ width, box }));
      if (width === 320) {
        await panel.getByText('연결 진단', { exact: true }).click();
        await expect(panel.getByText('panel-probe-local', { exact: true })).toBeVisible();
        await panel.getByText('플레이어 진단', { exact: true }).click();
        await expect(panel.getByText('idle', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: '연결 끊기' })).toBeInViewport();
        await panel.getByText('플레이어 진단', { exact: true }).click();
        await panel.getByText('연결 진단', { exact: true }).click();
      }
    }
    await input.fill('한글 조합');
    await input.dispatchEvent('keydown', { key: 'Enter', isComposing: true });
    await expect(input).toHaveValue('한글 조합');
    if (chats.length) throw Error('Composition submitted a message');
    await input.press('Enter');
    await expect(input).toHaveValue('');
    await expect.poll(() => chats.length).toBe(1);
    await page.getByRole('button', { name: '연결 끊기' }).click();
    await expect(page.getByRole('form', { name: '함께 플레이하기' })).toBeVisible();
    if (errors.length) throw Error(errors.join('\n'));
    console.log('Panel layout, synthetic IME guard, chat and disconnect passed; no page errors.');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
