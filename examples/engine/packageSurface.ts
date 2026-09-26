// Every public entry is loaded through its own `export *` module under ./surface. A dynamic import of the entry itself
// would make each route that imports from that entry load all of its exports (editor, postprocessing, physics) up front.
const surfaces = import.meta.glob<Record<string, unknown>>('./surface/*.ts');

export async function inspectPackageSurface() {
  const modules = await Promise.all(Object.entries(surfaces).map(async ([file, load]) => ({
    name: file.slice('./surface/'.length, -'.ts'.length),
    exports: Object.keys(await load()).length,
  })));
  await import('gaesup-world/style.css');
  return modules;
}
