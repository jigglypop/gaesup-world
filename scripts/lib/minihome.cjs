/**
 * The minihome keeps its view and environment controls in the collapsed "환경·카메라" panel. Opens it whenever the
 * room renders it, so probes can drive those controls across reloads.
 */
function openRoomSettingsOnLoad(page) {
  return page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      const details = document.querySelector('details.room-settings');
      if (!details) return;
      details.open = true;
      observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
  });
}

/**
 * Header file tools (undo/redo, backups, sharing) live in the collapsed "파일" menu. Its dropdown overlays the room
 * settings, so it is opened for one click and folded again.
 */
async function clickFileTool(page, name) {
  const menu = page.locator('details.world-files');
  await menu.locator('summary').click();
  await menu.getByRole('button', { name, exact: true }).click();
  await menu.locator('summary').click();
}

/** Saves the room's GLB export to `file`; a failed export reports the room notice instead of a bare download timeout. */
async function saveRoomGlb(page, file) {
  const download = page.waitForEvent('download').catch((error) => error);
  await page.getByRole('button', { name: '3D 방 내보내기 (.glb)', exact: true }).click();
  const result = await download;
  if (result instanceof Error) {
    const notice = await page.locator('.room-settings .room-notice').allTextContents();
    throw new Error(`GLB export produced no download. ${notice.join(' ')}`, { cause: result });
  }
  await result.saveAs(file);
}

module.exports = { openRoomSettingsOnLoad, clickFileTool, saveRoomGlb };
