const { chromium, expect } = require('@playwright/test');
const path = require('node:path');
const os = require('node:os');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: process.argv.includes('--compact')
      ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const consoleErrors = new Set();
    page.on('console', message => {
      if (message.type() === 'error' && !consoleErrors.has(message.text())) {
        consoleErrors.add(message.text());
        console.error(message.text());
      }
    });
    if (process.argv.includes('--camera')) {
      await page.route('**/src/core/camera/hooks/useCamera.ts*', async route => {
        const response = await route.fetch();
        const source = await response.text();
        const marker = 'system.calculate(calcPropsRef.current);';
        expect(source).toContain(marker);
        await route.fulfill({ response, body: source.replace(marker,
          `${marker} globalThis.__previewCamera = { camera: state.camera, activeState, config: system.getConfig() };`) });
      });
    }
    // Expose the existing body ref only in this test page; do not alter simulation.
    await page.route('**/src/core/hooks/useGenericRefs/index.tsx*', async route => {
      const response = await route.fetch();
      const source = await response.text();
      expect(source).toContain('return {');
      await route.fulfill({ response, body: source.replace('return {', 'globalThis.__previewBody = rigidBodyRef; return {') });
    });
    await page.goto('http://127.0.0.1:5173/blueprints', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => globalThis.__previewBody?.current?.translation());
    if (process.argv.includes('--inspect-gamepad')) {
      console.log(await page.locator('body').ariaSnapshot());
      await page.getByRole('button', { name: '게임패드 사용', exact: true }).click();
      console.log(await page.getByRole('group', { name: '화면 조작 버튼' }).ariaSnapshot());
      await page.screenshot({ path: path.join(os.tmpdir(), 'gaesup-preview-gamepad.png') });
      return;
    }
    const toggle = page.getByRole('button', { name: '키보드 사용', exact: true });
    const position = () => page.evaluate(() => {
      const { x, y, z } = globalThis.__previewBody.current.translation();
      return { x, y, z };
    });
    const measurements = [];
    if (process.argv.includes('--mouse')) {
      const mouseToggle = page.getByRole('button', { name: '마우스 사용', exact: true });
      const canvas = page.locator('canvas');
      const cameraConfig = () => page.evaluate(() => globalThis.__previewCamera.config);
      for (const enabled of [false, true, false]) {
        if ((await mouseToggle.getAttribute('aria-pressed')) !== String(enabled)) await mouseToggle.click();
        await expect(mouseToggle).toHaveAttribute('aria-pressed', String(enabled));
        const box = await canvas.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        const before = await cameraConfig();
        await page.mouse.wheel(0, 100);
        await new Promise(resolve => setTimeout(resolve, 500));
        const afterWheel = await cameraConfig();
        const zoomChange = Math.abs(afterWheel.zoom - before.zoom);
        console.log(JSON.stringify({ enabled, beforeZoom: before.zoom, afterZoom: afterWheel.zoom }));
        if (enabled) expect(zoomChange).toBeGreaterThan(0.01);
        else expect(zoomChange).toBe(0);
        await page.keyboard.down('ControlLeft');
        await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 8 });
        await page.keyboard.up('ControlLeft');
        await new Promise(resolve => setTimeout(resolve, 500));
        const afterOrbit = await cameraConfig();
        const orbitChange = Math.abs(afterOrbit.orbitYaw - afterWheel.orbitYaw);
        console.log(JSON.stringify({ enabled, orbitChange }));
        if (enabled) expect(orbitChange).toBeGreaterThan(0.02);
        else expect(orbitChange).toBeLessThan(0.001);
        await page.waitForFunction(() => {
          const velocity = globalThis.__previewBody.current.linvel();
          return Math.hypot(velocity.x, velocity.z) < 0.001;
        });
        const beforeClick = await position();
        await canvas.click({ position: { x: box.width * 0.7, y: box.height * 0.7 } });
        await new Promise(resolve => setTimeout(resolve, 500));
        const afterClick = await position();
        const clickDistance = Math.hypot(afterClick.x - beforeClick.x, afterClick.z - beforeClick.z);
        console.log(JSON.stringify({ enabled, clickDistance }));
        if (enabled) expect(clickDistance).toBeGreaterThan(0.1);
        else expect(clickDistance).toBeLessThan(0.05);
        await page.waitForFunction(() => {
          const velocity = globalThis.__previewBody.current.linvel();
          return Math.hypot(velocity.x, velocity.z) < 0.001;
        });
      }
      expect(errors).toEqual([]);
      expect([...consoleErrors]).toEqual([]);
      return;
    }
    if (process.argv.includes('--gamepad')) {
      const gamepadToggle = page.getByRole('button', { name: '게임패드 사용', exact: true });
      await gamepadToggle.click();
      const group = page.getByRole('group', { name: '화면 조작 버튼' });
      const forward = group.getByRole('button', { name: '앞으로', exact: true });
      await expect(forward).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'false');
      const settle = () => page.waitForFunction(() => {
        const velocity = globalThis.__previewBody.current.linvel();
        return Math.hypot(velocity.x, velocity.z) < 0.001;
      });
      const sample = async (name, moving) => {
        const before = await position();
        await new Promise(resolve => setTimeout(resolve, 500));
        const after = await position();
        const distance = Math.hypot(after.x - before.x, after.z - before.z);
        measurements.push({ name, distance });
        console.log(JSON.stringify(measurements.at(-1)));
        if (moving) expect(distance).toBeGreaterThan(0.1);
        else expect(distance).toBeLessThan(0.05);
      };
      const pressForward = async () => {
        await forward.scrollIntoViewIfNeeded();
        const box = await forward.boundingBox();
        expect(box).not.toBeNull();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await expect(forward).toHaveAttribute('aria-pressed', 'true');
      };
      await page.getByRole('heading', { name: '미리보기', exact: true }).click();
      await settle();
      await page.keyboard.down('KeyW');
      await sample('keyboard-disabled', false);
      await page.keyboard.up('KeyW');
      await pressForward();
      await sample('screen-only', true);
      await page.mouse.up();
      await settle();
      await sample('screen-released', false);
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', 'true');
      await pressForward();
      await page.keyboard.down('KeyW');
      await page.keyboard.up('KeyW');
      await sample('screen-held-after-keyup', true);
      await page.mouse.up();
      await settle();
      await pressForward();
      await page.keyboard.down('KeyW');
      await page.mouse.up();
      await sample('keyboard-held-after-pointerup', true);
      await page.keyboard.up('KeyW');
      await settle();
      await sample('all-released', false);
      await gamepadToggle.click();
      await expect(group).toHaveCount(0);
      await sample('gamepad-disabled', false);
      await gamepadToggle.click();
      await expect(forward).toHaveAttribute('aria-pressed', 'false');
      await forward.scrollIntoViewIfNeeded();
      const canvasBox = await page.locator('canvas').boundingBox();
      const gamepadBox = await group.boundingBox();
      expect(canvasBox.y + canvasBox.height).toBeLessThanOrEqual(gamepadBox.y + 1);
      for (const button of await group.getByRole('button').all()) {
        const box = await button.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
      }
      await page.screenshot({ path: path.join(os.tmpdir(), 'gaesup-preview-gamepad.png') });
      expect(errors).toEqual([]);
      expect([...consoleErrors]).toEqual([]);
      console.log(JSON.stringify({ measurements, errors }));
      return;
    }
    for (const enabled of [true, false, true]) {
      if ((await toggle.getAttribute('aria-pressed')) !== String(enabled)) await toggle.click();
      await expect(toggle).toHaveAttribute('aria-pressed', String(enabled));
      await page.getByRole('heading', { name: '미리보기', exact: true }).click();
      // Let movement from the previous sample settle before measuring another 500 ms.
      await new Promise(resolve => setTimeout(resolve, 600));
      const before = await position();
      await page.keyboard.down('KeyD');
      await new Promise(resolve => setTimeout(resolve, 500));
      await page.keyboard.up('KeyD');
      const after = await position();
      const distance = Math.hypot(after.x - before.x, after.z - before.z);
      if (process.argv.includes('--camera')) {
        const cameraSample = await page.evaluate(() => {
          const { camera, activeState, config } = globalThis.__previewCamera;
          return { camera: camera.position.toArray(), active: activeState.position.toArray(),
            projected: activeState.position.clone().project(camera).toArray(), config };
        });
        expect(Math.abs(cameraSample.projected[0])).toBeLessThan(1);
        expect(Math.abs(cameraSample.projected[1])).toBeLessThan(1);
        expect(cameraSample.projected[2]).toBeGreaterThan(-1);
        expect(cameraSample.projected[2]).toBeLessThan(1);
        expect(Math.hypot(cameraSample.camera[0], cameraSample.camera[1] - 10, cameraSample.camera[2] - 20)).toBeGreaterThan(1);
        console.log(JSON.stringify(cameraSample));
      }
      measurements.push({ enabled, before, after, distance });
      console.log(JSON.stringify(measurements.at(-1)));
      if (enabled) expect(distance).toBeGreaterThan(0.1);
      else expect(distance).toBeLessThan(0.05);
    }
    await page.screenshot({ path: path.join(os.tmpdir(), 'gaesup-preview-keyboard.png') });
    expect(errors).toEqual([]);
    expect([...consoleErrors]).toEqual([]);
    console.log(JSON.stringify({ measurements, errors }));
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
