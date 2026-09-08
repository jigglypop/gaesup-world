import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ASTRA_ROLE = 'astra_architect';
export const ASTRA_TAG = '[astra:architecture]';
export const ASTRA_REQUIRED_FIELDS = Object.freeze([
  'domains:',
  'current_boundary:',
  'current_source_of_truth:',
  'options:',
  'evidence:',
  'compatibility:',
  'irreversible_impact:',
  'decision_question:',
]);

export const ROLE_POLICY = Object.freeze({
  default: Object.freeze({
    model: 'gpt-5.6-luna',
    reasoningEffort: 'low',
    sandboxMode: 'read-only',
    maxForkTurns: 1,
  }),
  explorer: Object.freeze({
    model: 'gpt-5.6-luna',
    reasoningEffort: 'low',
    sandboxMode: 'read-only',
    maxForkTurns: 1,
  }),
  worker: Object.freeze({
    model: 'gpt-5.6-sol',
    reasoningEffort: 'low',
    sandboxMode: 'workspace-write',
    maxForkTurns: 2,
  }),
  architect: Object.freeze({
    model: 'gpt-5.6-sol',
    reasoningEffort: 'medium',
    sandboxMode: 'read-only',
    maxForkTurns: 2,
  }),
  astra_architect: Object.freeze({
    model: 'gpt-6-astra',
    reasoningEffort: 'low',
    sandboxMode: 'read-only',
    maxForkTurns: 0,
  }),
  runtime: Object.freeze({
    model: 'gpt-5.6-sol',
    reasoningEffort: 'medium',
    sandboxMode: 'workspace-write',
    maxForkTurns: 2,
  }),
  platform: Object.freeze({
    model: 'gpt-5.6-sol',
    reasoningEffort: 'medium',
    sandboxMode: 'workspace-write',
    maxForkTurns: 2,
  }),
  reviewer: Object.freeze({
    model: 'gpt-5.6-terra',
    reasoningEffort: 'medium',
    sandboxMode: 'read-only',
    maxForkTurns: 2,
  }),
  api_surface_guard: Object.freeze({
    model: 'gpt-5.6-luna',
    reasoningEffort: 'low',
    sandboxMode: 'read-only',
    maxForkTurns: 1,
  }),
  frame_perf_auditor: Object.freeze({
    model: 'gpt-5.6-terra',
    reasoningEffort: 'medium',
    sandboxMode: 'read-only',
    maxForkTurns: 1,
  }),
  invariant_guard: Object.freeze({
    model: 'gpt-5.6-terra',
    reasoningEffort: 'medium',
    sandboxMode: 'read-only',
    maxForkTurns: 1,
  }),
  layer_auditor: Object.freeze({
    model: 'gpt-5.6-terra',
    reasoningEffort: 'low',
    sandboxMode: 'read-only',
    maxForkTurns: 1,
  }),
});

const MAX_AGENT_MESSAGE_CHARS = 6000;
const MAX_ASTRA_MESSAGE_CHARS = 2500;

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

export const isAstraModel = (model) => {
  if (typeof model !== 'string') {
    return false;
  }

  const modelSegment = model.trim().toLowerCase().split('/').at(-1) ?? '';
  return modelSegment === 'gpt-6-astra' || modelSegment.startsWith('gpt-6-astra-');
};

const denyTool = (reason) => ({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
  },
});

const blockTurn = (reason) => ({
  continue: false,
  stopReason: reason,
  systemMessage: reason,
});

const blockPrompt = (reason) => ({ decision: 'block', reason });

const parseForkTurns = (value) => {
  if (value === 'none') {
    return 0;
  }

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return undefined;
  }

  return Number(value);
};

const getPacketFieldValue = (message, field) => {
  const line = message.split(/\r?\n/).find((candidate) => candidate.trimStart().startsWith(field));
  return line?.trimStart().slice(field.length).trim();
};

const getTomlValue = (source, key) => {
  const match = source.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, 'm'));
  return match?.[1];
};

const getAgentProjectionError = (agentType, policy) => {
  const fileName = `${agentType.replaceAll('_', '-')}.toml`;

  try {
    const source = readFileSync(new URL(`../agents/${fileName}`, import.meta.url), 'utf8');
    const projected = {
      name: getTomlValue(source, 'name'),
      model: getTomlValue(source, 'model'),
      reasoningEffort: getTomlValue(source, 'model_reasoning_effort'),
      sandboxMode: getTomlValue(source, 'sandbox_mode'),
    };

    if (
      projected.name !== agentType ||
      projected.model !== policy.model ||
      projected.reasoningEffort !== policy.reasoningEffort ||
      projected.sandboxMode !== policy.sandboxMode
    ) {
      return `${fileName}이 canonical ROLE_POLICY와 다릅니다. pnpm test:harness를 실행하세요.`;
    }
  } catch {
    return `${fileName}을 읽을 수 없어 agent spawn을 차단했습니다.`;
  }

  return undefined;
};

const evaluateAgentSpawn = (input) => {
  if (isAstraModel(input.model)) {
    return denyTool('Astra 에이전트의 재위임은 토큰 정책으로 차단됩니다.');
  }

  if (!isRecord(input.tool_input)) {
    return denyTool('agent spawn 입력이 유효하지 않아 fail-closed 처리했습니다.');
  }

  const agentType = input.tool_input.agent_type;
  if (typeof agentType !== 'string' || !Object.hasOwn(ROLE_POLICY, agentType)) {
    return denyTool(`등록되지 않은 agent_type '${String(agentType)}'은 사용할 수 없습니다.`);
  }

  const policy = ROLE_POLICY[agentType];
  const projectionError = getAgentProjectionError(agentType, policy);
  if (projectionError) {
    return denyTool(projectionError);
  }

  const isSubagentCaller = input.agent_id !== undefined || input.agent_type !== undefined;
  if (isSubagentCaller && agentType !== ASTRA_ROLE) {
    return denyTool('Nested agent spawn is blocked to contain context and token usage.');
  }

  if (
    agentType === ASTRA_ROLE &&
    (input.agent_type !== 'architect' || input.model !== ROLE_POLICY.architect.model)
  ) {
    return denyTool('astra_architect can only be spawned by the configured Sol architect.');
  }

  const requestedModel = input.tool_input.model;
  if (requestedModel !== undefined && requestedModel !== policy.model) {
    return denyTool(`${agentType} 모델은 ${policy.model}로 고정되어 있습니다.`);
  }

  const requestedEffort = input.tool_input.reasoning_effort;
  if (requestedEffort !== undefined && requestedEffort !== policy.reasoningEffort) {
    return denyTool(
      `${agentType} reasoning_effort는 ${policy.reasoningEffort}로 고정되어 있습니다.`,
    );
  }

  const forkTurns = parseForkTurns(input.tool_input.fork_turns);
  if (forkTurns === undefined || forkTurns > policy.maxForkTurns) {
    const limit = policy.maxForkTurns === 0 ? 'none' : `none 또는 ${policy.maxForkTurns} 이하`;
    return denyTool(`${agentType} fork_turns는 ${limit}로 명시해야 합니다.`);
  }

  const message = input.tool_input.message;
  if (typeof message !== 'string' || message.length === 0) {
    return denyTool('agent message는 비어 있을 수 없습니다.');
  }

  const messageLimit = agentType === ASTRA_ROLE ? MAX_ASTRA_MESSAGE_CHARS : MAX_AGENT_MESSAGE_CHARS;
  if (message.length > messageLimit) {
    return denyTool(`${agentType} message는 ${messageLimit}자 이하로 요약해야 합니다.`);
  }

  if (agentType === ASTRA_ROLE) {
    if (!message.trimStart().startsWith(ASTRA_TAG)) {
      return denyTool(`${ASTRA_ROLE} message는 ${ASTRA_TAG} 태그로 시작해야 합니다.`);
    }

    const missingFields = ASTRA_REQUIRED_FIELDS.filter(
      (field) => !getPacketFieldValue(message, field),
    );
    if (missingFields.length > 0) {
      return denyTool(`Astra evidence packet 필드가 누락되었습니다: ${missingFields.join(', ')}`);
    }

    const domains = getPacketFieldValue(message, 'domains:')
      ?.split(',')
      .map((domain) => domain.trim())
      .filter(Boolean);
    const uniqueDomains = new Set(domains?.map((domain) => domain.toLowerCase()));
    if (uniqueDomains.size < 3) {
      return denyTool(
        'Astra evidence packet에는 쉼표로 구분한 architecture domain 3개가 필요합니다.',
      );
    }
  }

  return undefined;
};

export const evaluateHook = (input) => {
  if (!isRecord(input) || typeof input.hook_event_name !== 'string') {
    throw new Error('hook input schema is invalid');
  }

  const guardedEvents = new Set(['SessionStart', 'UserPromptSubmit', 'PreToolUse']);
  if (
    guardedEvents.has(input.hook_event_name) &&
    (typeof input.model !== 'string' || input.model.trim().length === 0)
  ) {
    const reason = 'active model을 확인할 수 없어 model policy를 fail-closed 처리했습니다.';
    if (input.hook_event_name === 'SessionStart') {
      return blockTurn(reason);
    }
    if (input.hook_event_name === 'UserPromptSubmit') {
      return blockPrompt(reason);
    }
    return denyTool(reason);
  }

  if (input.hook_event_name === 'SessionStart' && isAstraModel(input.model)) {
    return blockTurn(
      '루트 Astra 세션은 차단됩니다. gpt-5.6-sol을 사용하고 필요한 결정만 astra_architect에 위임하세요.',
    );
  }

  if (input.hook_event_name === 'UserPromptSubmit' && isAstraModel(input.model)) {
    return blockPrompt(
      '루트 Astra 요청은 차단됩니다. gpt-5.6-sol을 사용하고 필요한 결정만 astra_architect에 위임하세요.',
    );
  }

  if (input.hook_event_name !== 'PreToolUse') {
    return undefined;
  }

  if (isAstraModel(input.model)) {
    return denyTool('Astra는 전달된 evidence packet만 판정하며 모든 tool call이 차단됩니다.');
  }

  const toolName = typeof input.tool_name === 'string' ? input.tool_name.toLowerCase() : '';
  const isAgentTool =
    toolName === 'agent' ||
    toolName === 'spawn_agent' ||
    toolName.endsWith('.spawn_agent') ||
    toolName.endsWith('__spawn_agent');
  return isAgentTool ? evaluateAgentSpawn(input) : undefined;
};

const readStdin = async () => {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 1_000_000) {
      throw new Error('hook input exceeds 1 MB');
    }
  }
  return input;
};

const run = async () => {
  try {
    const rawInput = await readStdin();
    const result = evaluateHook(JSON.parse(rawInput));
    if (result !== undefined) {
      process.stdout.write(JSON.stringify(result));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Astra guard failed closed: ${message}\n`);
    process.exitCode = 2;
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await run();
}
