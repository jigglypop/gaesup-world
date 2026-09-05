const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, expect } = require('@playwright/test');

(async () => {
  const { build } = await import('vite');
  const entry = '\0focus-probe.js';
  const mock = '\0focus-backend.js';
  const component = path.resolve('examples/pages/world/focus.tsx').replaceAll('\\', '/');
  const built = await build({ configFile: false, logLevel: 'silent', plugins: [{
    name: 'focus-probe',
    resolveId(id) { if (id === 'focus-probe') return entry; if (id === 'gaesup-world') return mock; },
    load(id) {
      if (id === mock) return `const backend = {updateKeyboard(){}, updateMouse(){}};
        export const useInputBackend = () => backend;
        export const useGaesupStore = {getState:()=>({interaction:{isActive:true},setInteractionActive(){}})};
        export const requestCameraCloseUp = ()=>{}; export const restoreCameraCloseUp = ()=>{};`;
      if (id === entry) return `import React from 'react'; import {createRoot} from 'react-dom/client';
        import {WorldFocusModal} from '${component}';
        function App(){const [open,setOpen]=React.useState(false);const close=React.useCallback(()=>setOpen(false),[]);
          const focus=React.useMemo(()=>({id:'long',category:'농사',title:'작물 밭',target:[0,0,0],
            description:'땅을 갈고 씨앗을 심어 작물을 키워보세요.',details:Array.from({length:16},(_,i)=>(i+1)+'번 안내: 물을 주고 자라면 수확하세요.')}),[]);
          return React.createElement(React.Fragment,null,React.createElement('button',{onClick:()=>setOpen(true)},'설명 열기'),
            React.createElement(WorldFocusModal,{focus:open?focus:null,onClose:close}));}
        createRoot(document.getElementById('root')).render(React.createElement(App));`;
    },
  }], build: { write: false, rollupOptions: { input: 'focus-probe', output: { format: 'iife' } } } });
  const script = built.output.find((output) => output.type === 'chunk').code;
  const css = fs.readFileSync('examples/style.css', 'utf8');
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const [width, height] of [[320, 568], [844, 390], [1280, 720]]) {
      await page.setViewportSize({ width, height });
      await page.setContent('<html lang="ko"><body><div id="root"></div></body></html>');
      await page.addStyleTag({ content: css });
      await page.addScriptTag({ content: script });
      await expect(page.getByRole('button', { name: '설명 열기' })).toBeVisible();
      await page.getByRole('button', { name: '설명 열기' }).click();
      const dialog = page.getByRole('dialog', { name: '작물 밭' });
      await expect(dialog).toBeVisible();
      const close = dialog.getByRole('button', { name: '닫기' });
      await expect(close).toBeFocused();
      const content = page.locator('.world-focus-modal__content');
      assert.equal(await content.evaluate((node) => node.scrollTop), 0);
      await page.keyboard.press('PageDown');
      assert.ok(await content.evaluate((node) => node.scrollTop > 0));
      await page.keyboard.press('Home');
      assert.equal(await content.evaluate((node) => node.scrollTop), 0);
      await expect(close).toBeInViewport();
      const panel = await page.locator('.world-focus-modal__panel').boundingBox();
      assert.ok(panel.x >= 0 && panel.x + panel.width <= width && panel.y >= 0 && panel.y + panel.height <= height);
      const overflow = await dialog.evaluate((node) => node.scrollWidth > node.clientWidth);
      assert.equal(overflow, false);
      await page.keyboard.press('Tab');
      await expect(close).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(dialog).toBeHidden();
      await expect(page.getByRole('button', { name: '설명 열기' })).toBeFocused();
      results.push({ width, height, panel, overflow });
    }
    assert.deepEqual(errors, []);
    process.stdout.write(JSON.stringify({ results, errors }) + '\n');
  } finally { await browser.close(); }
})().catch((error) => { process.stderr.write(error.stack + '\n'); process.exitCode = 1; });
