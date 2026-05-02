import { createServer } from 'node:http';

const PORT = Number(process.env.RL_POLICY_PORT ?? 8091);
const DEFAULT_PROVIDER = (process.env.RL_PROVIDER ?? 'heuristic').toLowerCase();
const REQUEST_TIMEOUT_MS = Number(process.env.RL_REQUEST_TIMEOUT_MS ?? 5000);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? '';
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const OPENAI_URL = process.env.OPENAI_URL ?? 'https://api.openai.com/v1/chat/completions';

const HF_API_KEY = process.env.HF_API_KEY ?? '';
const HF_MODEL = process.env.HF_MODEL ?? 'meta-llama/Llama-3.1-8B-Instruct';
const HF_URL = process.env.HF_URL ?? `https://api-inference.huggingface.co/models/${HF_MODEL}`;

function json(res, code, body) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Policy-Provider',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk.toString('utf8');
      if (raw.length > 2_000_000) {
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function heuristicPolicy(payload) {
  const observation = payload?.observation;
  const current = observation?.position ?? [0, 0, 0];
  const perceived = Array.isArray(observation?.perceived) ? observation.perceived : [];
  if (perceived.length > 0) {
    const nearest = perceived[0];
    return {
      actions: [
        { type: 'moveTo', target: nearest.position, speed: 2.4, animationId: 'walk' },
        { type: 'speak', text: `Hey ${nearest.name}!`, duration: 1.2 },
      ],
      reason: 'heuristic nearest-follow',
      provider: 'heuristic',
    };
  }

  const t = Number(observation?.timestamp ?? Date.now() / 1000);
  const angle = (Math.sin(t * 0.91) * 0.5 + 0.5) * Math.PI * 2;
  const radius = 3.5;
  const target = [
    current[0] + Math.cos(angle) * radius,
    current[1] ?? 0,
    current[2] + Math.sin(angle) * radius,
  ];
  return {
    actions: [{ type: 'moveTo', target, speed: 2.0, animationId: 'walk' }],
    reason: 'heuristic wander',
    provider: 'heuristic',
  };
}

function normalizeActions(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((entry) => entry && typeof entry === 'object' && typeof entry.type === 'string')
    .slice(0, 4);
}

function extractJson(text) {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const first = trimmed.indexOf('{');
    const last = trimmed.lastIndexOf('}');
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(trimmed.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildPrompt(payload) {
  const observation = payload?.observation ?? {};
  return [
    'You are an NPC control policy.',
    'Return strict JSON: {"actions":[...],"reason":"..."}',
    'Allowed action types: moveTo, patrol, wander, playAnimation, speak, interact, remember, idle, lookAt',
    'Prefer at most 2 actions per step.',
    `Observation: ${JSON.stringify(observation)}`,
  ].join('\n');
}

async function withTimeout(promise, ms) {
  return await Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

async function callOpenAI(payload) {
  if (!OPENAI_API_KEY) return null;
  const response = await withTimeout(fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a game NPC policy model.' },
        { role: 'user', content: buildPrompt(payload) },
      ],
    }),
  }), REQUEST_TIMEOUT_MS);
  if (!response.ok) return null;
  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content ?? '';
  const parsed = extractJson(content);
  if (!parsed) return null;
  return {
    actions: normalizeActions(parsed.actions),
    reason: typeof parsed.reason === 'string' ? parsed.reason : 'openai policy',
    provider: 'openai',
  };
}

async function callHuggingFace(payload) {
  if (!HF_API_KEY) return null;
  const response = await withTimeout(fetch(HF_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: buildPrompt(payload),
      parameters: {
        max_new_tokens: 220,
        temperature: 0.2,
        return_full_text: false,
      },
    }),
  }), REQUEST_TIMEOUT_MS);
  if (!response.ok) return null;
  const body = await response.json();
  const generated = Array.isArray(body) ? body[0]?.generated_text : body?.generated_text;
  const parsed = extractJson(generated);
  if (!parsed) return null;
  return {
    actions: normalizeActions(parsed.actions),
    reason: typeof parsed.reason === 'string' ? parsed.reason : 'huggingface policy',
    provider: 'huggingface',
  };
}

async function resolvePolicy(payload, provider) {
  if (provider === 'openai') {
    const out = await callOpenAI(payload);
    return out ?? heuristicPolicy(payload);
  }
  if (provider === 'huggingface') {
    const out = await callHuggingFace(payload);
    return out ?? heuristicPolicy(payload);
  }
  return heuristicPolicy(payload);
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    json(res, 204, {});
    return;
  }

  if (req.method !== 'POST' || req.url !== '/policy/step') {
    json(res, 404, { error: 'Not found' });
    return;
  }

  try {
    const payload = await readBody(req);
    const provider = String(req.headers['x-policy-provider'] ?? payload?.provider ?? DEFAULT_PROVIDER).toLowerCase();
    const decision = await resolvePolicy(payload, provider);
    const actions = normalizeActions(decision.actions);
    json(res, 200, {
      actions,
      reason: decision.reason ?? 'policy',
      provider,
      ttlMs: clamp(Number(payload?.ttlMs ?? 700), 200, 2000),
    });
  } catch (error) {
    json(res, 400, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

server.listen(PORT);
