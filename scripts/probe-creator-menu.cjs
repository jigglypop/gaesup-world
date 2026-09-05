const { chromium, expect } = require('@playwright/test');
const path = require('node:path');

(async () => {
  const startedAt = Date.now();
  const heartbeat = setInterval(() => console.log(JSON.stringify({ stage: 'heartbeat', elapsedMs: Date.now() - startedAt })), 10000);
  heartbeat.unref();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', (error) => { errors.push(error.message); console.error(error.message); });
    await page.goto('http://127.0.0.1:5173/creator');
    const hierarchy = page.getByRole('button', { name: '계층', exact: true });
    await hierarchy.waitFor({ state: 'visible' });
    await hierarchy.click();
    console.log(await page.locator('body').ariaSnapshot());
    await page.waitForLoadState('networkidle');
    const tree = page.getByRole('tree', { name: '장면 계층' });
    await tree.waitFor({ state: 'visible' });
    const expand = tree.getByRole('button', { name: '하위 객체 펼치기', exact: true });
    if (await expand.count() !== 1) throw new Error('Expected one collapsed root');
    await expand.click();
    await tree.getByText('하위 장면 표식', { exact: true }).waitFor({ state: 'visible' });
    await page.screenshot({ path: path.join(process.env.TEMP, 'gaesup-creator-hierarchy.png') });
    console.log(await tree.ariaSnapshot());
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(process.env.TEMP, 'gaesup-creator-hierarchy-desktop.png') });
    await page.getByRole('button', { name: '속성', exact: true }).click();
    console.log(await page.getByRole('complementary', { name: '편집 도구' }).ariaSnapshot());
    if (process.argv.includes('--layout-only')) {
      for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(viewport);
        const fields = await page.locator('.vector-input__field').evaluateAll((elements) => elements.map((element) => {
          const label = element.querySelector('span').getBoundingClientRect();
          const input = element.querySelector('input').getBoundingClientRect();
          const field = element.getBoundingClientRect();
          return { labelRight: label.right, inputLeft: input.left, inputRight: input.right, fieldRight: field.right };
        }));
        if (fields.length !== 9 || fields.some((field) => field.labelRight > field.inputLeft || field.inputRight > field.fieldRight + 1))
          throw new Error('Vector input fields overlap: ' + JSON.stringify(fields));
        await page.screenshot({ path: path.join(process.env.TEMP, `gaesup-creator-vector-${viewport.width}.png`) });
      }
      if (errors.length) throw new Error(errors.join('\n'));
      console.log('Vector layout passed at desktop and mobile sizes');
      return;
    }
    const position = page.getByRole('spinbutton', { name: '위치 X', exact: true });
    console.log('inspector: clear position');
    await position.fill('');
    await position.press('Tab');
    await expect(position).toHaveValue('8');
    await position.fill('-2.75');
    console.log('inspector: commit position');
    await position.press('Enter');
    const tags = page.getByRole('textbox', { name: '태그', exact: true });
    console.log('inspector: tags');
    await tags.fill('example, ');
    console.log('inspector: tags filled');
    await expect(tags).toHaveValue('example, ');
    await tags.pressSequentially('forest');
    console.log('inspector: tags typed');
    await tags.press('Enter');
    console.log('inspector: tags committed');
    const rotation = page.getByRole('spinbutton', { name: '회전 (라디안) Y', exact: true });
    console.log('inspector: fill rotation');
    await rotation.fill('1.57');
    console.log('inspector: blur rotation');
    await rotation.press('Tab');
    console.log('inspector: reopen hierarchy');
    await page.getByRole('button', { name: '계층', exact: true }).click();
    await expect(tree).toBeVisible();
    await page.getByRole('button', { name: '속성', exact: true }).click();
    await expect(position).toHaveValue('-2.75');
    await expect(tags).toHaveValue('example, forest');
    await expect(rotation).toHaveValue('1.57');
    console.log('inspector: values retained');
    await page.screenshot({ path: path.join(process.env.TEMP, 'gaesup-creator-input-desktop.png') });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(position).toBeVisible();
    await position.fill('');
    await position.press('Tab');
    await expect(position).toHaveValue('-2.75');
    await page.screenshot({ path: path.join(process.env.TEMP, 'gaesup-creator-input-mobile.png') });
    console.log(JSON.stringify({ stage: 'inspector-inputs', position: await position.inputValue(), tags: await tags.inputValue(), rotation: await rotation.inputValue() }));
    if (errors.length) throw new Error(errors.join('\n'));
    console.log(JSON.stringify({ errors }));
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    clearInterval(heartbeat);
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
