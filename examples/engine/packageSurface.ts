export async function inspectPackageSurface() {
  const names = [
    'world',
    'admin',
    'assets',
    'avatar',
    'blueprints',
    'blueprintEditor',
    'building',
    'editor',
    'gameplay',
    'navigation',
    'network',
    'next',
    'plugins',
    'postprocessing',
    'runtime',
    'serverContracts',
  ];
  const modules = await Promise.all([
    import('gaesup-world'),
    import('gaesup-world/admin'),
    import('gaesup-world/assets'),
    import('gaesup-world/avatar'),
    import('gaesup-world/blueprints'),
    import('gaesup-world/blueprints/editor'),
    import('gaesup-world/building'),
    import('gaesup-world/editor'),
    import('gaesup-world/gameplay'),
    import('gaesup-world/navigation'),
    import('gaesup-world/network'),
    import('gaesup-world/next'),
    import('gaesup-world/plugins'),
    import('gaesup-world/postprocessing'),
    import('gaesup-world/runtime'),
    import('gaesup-world/server-contracts'),
  ]);
  await import('gaesup-world/style.css');
  return modules.map((module, index) => ({
    name: names[index] ?? '',
    exports: Object.keys(module).length,
  }));
}
