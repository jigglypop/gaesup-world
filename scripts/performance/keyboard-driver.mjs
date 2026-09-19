/** Drive the same prompts presented to a person; assertions live in the scenario. */
export async function exerciseWorldKeyboard(page, onStep = async () => {}) {
  const step = async id => { await page.locator(`[data-input-step="${id}"]`).waitFor(); await onStep(id); };
  const surface = id => page.locator(`[data-input-world="${id}"] [data-focus-target]`);
  await step('a-w'); await surface('A').click(); await page.keyboard.down('w');
  await step('focus-b'); await surface('B').click();
  await step('b-f'); await page.keyboard.up('w'); await page.keyboard.press('f');
  await step('editor'); await page.getByLabel('월드 B 텍스트').click(); await page.keyboard.type('wf');
  await step('touch-a'); await page.getByRole('button', { name: '도구 A', exact: true }).click();
  await step('disposed-a'); await surface('A').click(); await page.keyboard.down('w');
  await step('restarted-a'); await page.keyboard.up('w'); await page.keyboard.down('w');
  await page.locator('[data-input-step="restarted-a"]').waitFor({ state: 'hidden' }); await page.keyboard.up('w');
}
