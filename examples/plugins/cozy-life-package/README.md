# Example Cozy Life Plugin Package

This folder is shaped like a standalone plugin package. A real package would import from `gaesup-world/plugins` and expose the same `createExampleCozyLifePackagePlugin` factory from its package root.

```ts
import { createGaesupRuntime, createCatalogPlugin } from 'gaesup-world';
import { createExampleCozyLifePackagePlugin } from '@gaesup-example/plugin-cozy-life';

const runtime = createGaesupRuntime({
  plugins: [
    createCatalogPlugin(),
    createExampleCozyLifePackagePlugin(),
  ],
});
```

The package keeps `gaesup-world` as a peer dependency so game-specific code does not add new dependencies to the core package.
