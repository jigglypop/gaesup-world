import { createGaesupRuntime, createNPCPlugin } from 'gaesup-world';

import { acceptScenario } from './scenario';

acceptScenario('S-H11', async () => {
  const fetches: string[] = [];
  const originalFetch = globalThis.fetch;
  // Nothing listens on the default policy endpoint, as on a player's machine.
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    fetches.push(String(input));
    throw new TypeError('connect ECONNREFUSED');
  }) as typeof fetch;
  const runtime = createGaesupRuntime({ plugins: [createNPCPlugin()] });
  try {
    await runtime.setup();
    const npc = runtime.npcStore.getState();
    npc.initializeDefaults();
    const templateId = [...runtime.npcStore.getState().templates.keys()][0]!;
    for (let index = 0; index < 30; index += 1) npc.createInstanceFromTemplate(templateId, [index * 2, 0, 0]);
    runtime.clockLoop.clock.stepTicks(60 * 60);
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { externalFetches: fetches.length };
  } finally {
    await runtime.dispose();
    globalThis.fetch = originalFetch;
  }
});
