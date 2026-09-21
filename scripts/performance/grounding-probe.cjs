const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { performance } = require('node:perf_hooks');

async function main() {
  const root = path.resolve(__dirname, '../..');
  const output = path.join(root, '.artifacts/performance/grounding', new Date().toISOString().replace(/[:.]/g, '-'));
  fs.mkdirSync(output, { recursive: true });
  const ts = require('typescript');
  const modulePath = path.join(output, 'probe.cjs');
  const source = fs.readFileSync(path.join(root, 'src/core/motions/core/system/GroundContactProbe.ts'), 'utf8');
  fs.writeFileSync(modulePath, ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText);
  const { GroundContactProbe } = require(modulePath);
  const { sourceIdentity } = await import('./source-identity.mjs');
  const modules = process.argv.slice(2);
  if (!modules.length) modules.push(createRequire(require.resolve('@react-three/rapier')).resolve('@dimforge/rapier3d-compat'));
  const result = { source: sourceIdentity(root), kind: 'exploratory-node-contact-query', results: [] };
  for (const module of modules) {
    const R = require(path.resolve(module)); await R.init();
    const checks = [];
    const w = new R.World({ x: 0, y: 0, z: 0 });
    try {
      const floor = w.createCollider(R.ColliderDesc.trimesh(new Float32Array([-4,10,-4,-4,10,4,4,10,-4,4,10,4]), new Uint32Array([0,1,2,2,1,3])));
      const body = w.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(0,10.499,0).lockRotations());
      w.createCollider(R.ColliderDesc.capsule(0.25,0.25), body); w.step();
      const probe = new GroundContactProbe();
      checks.push({ name: 'mesh-ground', expected: true, actual: probe.read(w, body, {}) });
      body.setTranslation({ x: 100, y: 10.499, z: 0 }, true);
      checks.push({ name: 'teleport-clears-support', expected: false, actual: probe.read(w, body, {}) });
      body.setTranslation({ x: 0, y: 10.499, z: 0 }, true); w.step(); floor.setSolverGroups(0);
      checks.push({ name: 'solver-group-change', expected: false, actual: probe.read(w, body, {}) });
    } finally { w.free(); }
    const movingWorld = new R.World({ x: 0, y: -9.81, z: 0 });
    try {
      movingWorld.createCollider(R.ColliderDesc.cuboid(2000, 0.25, 4).setTranslation(0, 9.75, 0));
      const body = movingWorld.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(-995, 10.499, 0).lockRotations());
      movingWorld.createCollider(R.ColliderDesc.capsule(0.25, 0.25), body);
      const probe = new GroundContactProbe();
      for (let i = 0; i < 60; i++) movingWorld.step();
      let misses = 0;
      for (let i = 0; i < 120; i++) {
        body.setLinvel({ x: 10, y: body.linvel().y, z: 0 }, true); movingWorld.step();
        misses += Number(!probe.read(movingWorld, body, {}));
      }
      checks.push({ name: 'large-floor-moving-misses', expected: 0, actual: misses });
    } finally { movingWorld.free(); }
    const runs = [];
    for (const count of [100, 1000]) {
      const world = new R.World({ x: 0, y: -9.81, z: 0 });
      try {
        world.createCollider(R.ColliderDesc.cuboid(count * 2, 0.25, 4).setTranslation(0, 9.75, 0));
        const actors = Array.from({ length: count }, (_, index) => {
          const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation((index - count / 2) * 2, 10.499, 0).lockRotations());
          world.createCollider(R.ColliderDesc.capsule(0.25, 0.25), body);
          return { body, probe: new GroundContactProbe() };
        });
        for (let i = 0; i < 60; i++) world.step();
        for (const dirty of [false, true]) {
          const samples = [];
          for (let repeat = 0; repeat < 8; repeat++) {
            world.step();
            if (dirty) for (const { body } of actors) body.setTranslation(body.translation(), true);
            const start = performance.now(); let grounded = 0;
            for (const { body, probe } of actors) grounded += Number(probe.read(world, body, {}));
            const elapsed = performance.now() - start;
            if (grounded !== count) {
              const actor = actors.find(({ body, probe }) => !probe.read(world, body, {}));
              const contacts = [];
              world.contactPairsWith(actor.body.collider(0), other => {
                const manifolds = [];
                world.contactPair(actor.body.collider(0), other, (m, flipped) => manifolds.push({ normal: m.normal(), flipped, contacts: m.numContacts(), solver: m.numSolverContacts() }));
                contacts.push({ contact: actor.body.collider(0).contactCollider(other, 0.03), manifolds });
              });
              checks.push({ name: `batch-${count}-${dirty}-${repeat}`, expected: count, actual: grounded, position: actor.body.translation(), velocity: actor.body.linvel(), contacts });
            }
            if (repeat >= 3) samples.push(elapsed);
          }
          runs.push({ count, dirty, batchMs: samples });
        }
      } finally { world.free(); }
    }
    const entry = { version: R.version(), module, checks, runs };
    result.results.push(entry); console.log(JSON.stringify({ version: entry.version, failed: checks.filter(check => check.expected !== check.actual).length, runs }));
    if (checks.some(check => check.expected !== check.actual)) process.exitCode = 1;
  }
  fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(result, null, 2));
  console.log(`Evidence: ${output}`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
