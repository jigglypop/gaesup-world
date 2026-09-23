import { sourceIdentity } from './source-identity.mjs';

/** @returns {import('vite').Plugin} */
export function performanceIdentityPlugin() {
  let root = process.cwd();
  return {
    name: 'gaesup-performance-identity',
    config(config) {
      root = config.root ?? root;
      return { define: { __PERFORMANCE_BUILD__: JSON.stringify(sourceIdentity(root)) } };
    },
    configureServer(server) {
      server.middlewares.use('/__performance/source', (_req, res) => {
        try {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(sourceIdentity(root)));
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(error) }));
        }
      });
    },
  };
}
