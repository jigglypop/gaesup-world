const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

async function main() {
  const output = path.resolve(__dirname, '../../.asset-work/quaternius');
  const packs = {
    'stylized-nature-megakit': 'Stylized Nature MegaKit[Standard].zip',
    'universal-base-characters': 'Universal Base Characters[Standard].zip',
    'modular-character-outfits-fantasy': 'Modular Character Outfits - Fantasy[Standard].zip',
  };
  const pack = process.argv[2] ?? 'stylized-nature-megakit';
  if (!Object.hasOwn(packs, pack)) throw new Error('Unsupported pack');
  const destination = path.join(output, `${pack}-standard.zip`);
  if (fs.existsSync(destination)) { console.log('Using cached Standard archive.'); return; }
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ acceptDownloads: true });
    await page.goto(`https://quaternius.itch.io/${pack}/purchase`);
    await page.getByText('No thanks, just take me to the downloads', { exact: true }).click();
    await page.getByText(packs[pack], { exact: true }).waitFor();
    const pending = page.waitForEvent('download', { timeout: 60000 });
    await page.getByRole('link', { name: 'Download', exact: true }).click();
    const download = await pending;
    if (download.suggestedFilename() !== packs[pack]) throw new Error('Unexpected asset archive');
    await download.saveAs(destination);
    console.log(`Downloaded free Standard archive: ${fs.statSync(destination).size} bytes`);
  } finally {
    await browser.close();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
