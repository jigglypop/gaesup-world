import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  ASTRA_REQUIRED_FIELDS,
  ASTRA_ROLE,
  ASTRA_TAG,
  ROLE_POLICY,
  evaluateHook,
  isAstraModel,
} from './astra-guard.mjs';

const HOOK_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HOOK_DIR, '../..');
const HOOK_PATH = resolve(HOOK_DIR, 'astra-guard.mjs');

const createHookInput = (overrides = {}) => ({
  hook_event_name: 'PreToolUse',
  model: 'gpt-5.6-sol',
  tool_name: 'spawn_agent',
  tool_input: {
    agent_type: 'worker',
    fork_turns: '2',
    message: 'Implement the bounded task.',
  },
  ...overrides,
});

const getTomlValue = (source, key) => {
  const match = source.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`, 'm'));
  return match?.[1];
};

test('Astra model matcher rejects only canonical Astra slugs', () => {
  assert.equal(isAstraModel('gpt-6-astra'), true);
  assert.equal(isAstraModel('openai/gpt-6-astra-2026-09-01'), true);
  assert.equal(isAstraModel(' GpT-6-AsTrA '), true);
  assert.equal(isAstraModel('my-astra-model'), false);
  assert.equal(isAstraModel('gpt-5.6-sol'), false);
});

test('root Astra sessions and prompts are blocked', () => {
  const sessionResult = evaluateHook({ hook_event_name: 'SessionStart', model: 'gpt-6-astra' });
  const promptResult = evaluateHook({
    hook_event_name: 'UserPromptSubmit',
    model: 'gpt-6-astra',
    prompt: 'Fix a typo.',
  });

  assert.equal(sessionResult?.continue, false);
  assert.equal(promptResult?.decision, 'block');
  assert.equal(
    evaluateHook({ hook_event_name: 'UserPromptSubmit', model: 'gpt-5.6-sol' }),
    undefined,
  );

  for (const hookEventName of ['SessionStart', 'UserPromptSubmit', 'PreToolUse']) {
    const missingModel = evaluateHook({ hook_event_name: hookEventName });
    const blocked =
      missingModel?.continue === false ||
      missingModel?.decision === 'block' ||
      missingModel?.hookSpecificOutput.permissionDecision === 'deny';
    assert.equal(blocked, true, `${hookEventName} must fail closed without a model`);
  }
});

test('registered cheap roles require bounded context and fixed routing', () => {
  assert.equal(evaluateHook(createHookInput()), undefined);
  for (const caller of ['worker', 'architect', 'reviewer']) {
    const nested = evaluateHook(createHookInput({ agent_id: 'agent-1', agent_type: caller }));
    assert.equal(
      nested?.hookSpecificOutput.permissionDecision,
      'deny',
      `${caller} must not spawn a regular nested agent`,
    );
  }
  assert.equal(
    evaluateHook(createHookInput({ agent_id: 'agent-1' }))?.hookSpecificOutput.permissionDecision,
    'deny',
  );
  assert.equal(
    evaluateHook(
      createHookInput({
        tool_input: {
          agent_type: 'worker',
          fork_turns: 'all',
          message: 'Implement the bounded task.',
        },
      }),
    )?.hookSpecificOutput.permissionDecision,
    'deny',
  );
  assert.equal(
    evaluateHook(
      createHookInput({
        tool_input: {
          agent_type: 'worker',
          fork_turns: '2',
          message: 'Implement the bounded task.',
          model: 'gpt-6-astra',
        },
      }),
    )?.hookSpecificOutput.permissionDecision,
    'deny',
  );
  assert.equal(
    evaluateHook(
      createHookInput({
        tool_input: {
          agent_type: 'unknown',
          fork_turns: 'none',
          message: 'Pretend to be an architect.',
        },
      }),
    )?.hookSpecificOutput.permissionDecision,
    'deny',
  );
});

test('Astra is allowed only through the tagged zero-context role', () => {
  const evidencePacket = [
    ASTRA_TAG,
    'domains: world-model, runtime, persistence',
    'current_boundary: Runtime owns projection.',
    'current_source_of_truth: WorldDocument.',
    'options: A or B.',
    'evidence: Both paths affect three domains.',
    'compatibility: Keep the current adapter.',
    'irreversible_impact: Public save schema.',
    'decision_question: Which boundary should own writes?',
  ].join('\n');
  const allowed = createHookInput({
    agent_type: 'architect',
    tool_input: {
      agent_type: ASTRA_ROLE,
      fork_turns: 'none',
      message: evidencePacket,
    },
  });

  assert.equal(evaluateHook(allowed), undefined);
  for (const invalidPacket of [
    evidencePacket.replace('evidence: Both paths affect three domains.', 'evidence:'),
    evidencePacket.replace(
      'domains: world-model, runtime, persistence',
      'domains: runtime, persistence',
    ),
    evidencePacket.replace(
      'domains: world-model, runtime, persistence',
      'domains: runtime, Runtime, runtime',
    ),
  ]) {
    assert.equal(
      evaluateHook({
        ...allowed,
        tool_input: { ...allowed.tool_input, message: invalidPacket },
      })?.hookSpecificOutput.permissionDecision,
      'deny',
    );
  }
  for (const caller of [undefined, 'worker', 'reviewer']) {
    const denied = evaluateHook({ ...allowed, agent_type: caller });
    assert.equal(
      denied?.hookSpecificOutput.permissionDecision,
      'deny',
      `Astra route must reject caller ${String(caller)}`,
    );
  }
  assert.equal(
    evaluateHook(
      createHookInput({
        agent_type: 'architect',
        tool_input: {
          agent_type: ASTRA_ROLE,
          fork_turns: 'none',
          message: `${ASTRA_TAG}\nResolve the cross-domain source-of-truth decision.`,
        },
      }),
    )?.hookSpecificOutput.permissionDecision,
    'deny',
  );
  assert.equal(
    evaluateHook({ ...allowed, model: 'gpt-6-astra' })?.hookSpecificOutput.permissionDecision,
    'deny',
  );
});

test('Astra cannot call tools and non-Astra tools pass unchanged', () => {
  for (const toolName of ['Bash', 'apply_patch', 'mcp__filesystem__read_file', 'spawn_agent']) {
    const denied = evaluateHook(
      createHookInput({ model: 'gpt-6-astra', tool_name: toolName, tool_input: {} }),
    );
    assert.equal(denied?.hookSpecificOutput.permissionDecision, 'deny');
  }

  assert.equal(
    evaluateHook(createHookInput({ tool_name: 'Bash', tool_input: { cmd: 'rg x' } })),
    undefined,
  );
  assert.equal(ASTRA_REQUIRED_FIELDS.length, 8);
});

test('hook process is silent on allow and fails closed on malformed input', () => {
  const allowed = spawnSync(process.execPath, [HOOK_PATH], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    input: JSON.stringify(createHookInput()),
    timeout: 3000,
  });
  const malformed = spawnSync(process.execPath, [HOOK_PATH], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    input: '{',
    timeout: 3000,
  });

  assert.equal(allowed.status, 0);
  assert.equal(allowed.stdout, '');
  assert.equal(malformed.status, 2);
  assert.match(malformed.stderr, /failed closed/i);
});

test('agent files match the routing policy and isolate Astra', () => {
  const agentDir = resolve(REPO_ROOT, '.codex/agents');
  const agentFiles = readdirSync(agentDir).filter((file) => file.endsWith('.toml'));
  const configuredRoles = new Set();
  const astraRoles = [];

  for (const file of agentFiles) {
    const source = readFileSync(resolve(agentDir, file), 'utf8');
    const name = getTomlValue(source, 'name');
    const model = getTomlValue(source, 'model');
    const effort = getTomlValue(source, 'model_reasoning_effort');
    const sandboxMode = getTomlValue(source, 'sandbox_mode');
    const policy = name ? ROLE_POLICY[name] : undefined;

    assert.ok(policy, `${file} has an unregistered role`);
    assert.equal(model, policy.model, `${file} model drifted`);
    assert.equal(effort, policy.reasoningEffort, `${file} effort drifted`);
    assert.equal(sandboxMode, policy.sandboxMode, `${file} sandbox drifted`);
    configuredRoles.add(name);
    if (isAstraModel(model)) {
      astraRoles.push(name);
    }
  }

  for (const role of Object.keys(ROLE_POLICY)) {
    assert.ok(configuredRoles.has(role), `${role} is missing an agent config`);
  }
  assert.deepEqual(astraRoles, [ASTRA_ROLE]);
});

test('Codex config and hooks retain the low-token enforcement boundary', () => {
  const config = readFileSync(resolve(REPO_ROOT, '.codex/config.toml'), 'utf8');
  const hooks = JSON.parse(readFileSync(resolve(REPO_ROOT, '.codex/hooks.json'), 'utf8'));
  const toolHook = hooks.hooks.PreToolUse.find((group) => group.matcher === '.*');

  assert.equal(getTomlValue(config, 'model'), 'gpt-5.6-sol');
  assert.equal(getTomlValue(config, 'model_reasoning_effort'), 'low');
  assert.equal(getTomlValue(config, 'model_reasoning_summary'), 'none');
  assert.equal(getTomlValue(config, 'model_verbosity'), 'low');
  assert.equal(getTomlValue(config, 'default_subagent_model'), ROLE_POLICY.default.model);
  assert.equal(
    getTomlValue(config, 'default_subagent_reasoning_effort'),
    ROLE_POLICY.default.reasoningEffort,
  );
  assert.match(config, /^hooks\s*=\s*true$/m);
  assert.match(config, /^fast_mode\s*=\s*false$/m);
  assert.match(config, /^max_context_tokens\s*=\s*3000$/m);
  assert.match(config, /^max_concurrent_threads_per_session\s*=\s*2$/m);
  assert.match(config, /^tool_output_token_limit\s*=\s*6000$/m);
  assert.ok(toolHook);
  assert.ok(hooks.hooks.SessionStart);
  assert.ok(hooks.hooks.UserPromptSubmit);
  assert.equal(toolHook.hooks[0].async, undefined);
  assert.doesNotMatch(toolHook.hooks[0].command, /git rev-parse/);
  assert.doesNotMatch(toolHook.hooks[0].commandWindows, /git rev-parse/);
  assert.match(toolHook.hooks[0].command, /repository handler not found/);
  assert.match(toolHook.hooks[0].commandWindows, /repository handler not found/);
});

test('configured hook launchers work from a nested directory', () => {
  const hooks = JSON.parse(readFileSync(resolve(REPO_ROOT, '.codex/hooks.json'), 'utf8'));
  const inputs = {
    SessionStart: { hook_event_name: 'SessionStart', model: 'gpt-5.6-sol', source: 'startup' },
    UserPromptSubmit: {
      hook_event_name: 'UserPromptSubmit',
      model: 'gpt-5.6-sol',
      prompt: 'Handle a routine task.',
    },
    PreToolUse: createHookInput(),
  };

  for (const [eventName, input] of Object.entries(inputs)) {
    const handler = hooks.hooks[eventName][0].hooks[0];
    const command = process.platform === 'win32' ? handler.commandWindows : handler.command;
    const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
    const args =
      process.platform === 'win32' ? ['-NoProfile', '-Command', command] : ['-c', command];
    const result = spawnSync(shell, args, {
      cwd: resolve(REPO_ROOT, 'src'),
      encoding: 'utf8',
      input: JSON.stringify(input),
      timeout: 3000,
    });

    assert.equal(result.status, 0, `${eventName}: ${result.stderr}`);
    assert.equal(result.stdout, '', eventName);
  }
});

test('configured hook launchers fail closed with event-specific semantics', () => {
  const hooks = JSON.parse(readFileSync(resolve(REPO_ROOT, '.codex/hooks.json'), 'utf8'));
  const cases = [
    {
      eventName: 'SessionStart',
      input: { hook_event_name: 'SessionStart', model: 'gpt-5.6-sol', source: 'startup' },
      assertBlocked: (result) => assert.equal(JSON.parse(result.stdout).continue, false),
    },
    {
      eventName: 'UserPromptSubmit',
      input: {
        hook_event_name: 'UserPromptSubmit',
        model: 'gpt-5.6-sol',
        prompt: 'Handle a routine task.',
      },
      assertBlocked: (result) => assert.equal(JSON.parse(result.stdout).decision, 'block'),
    },
    {
      eventName: 'PreToolUse',
      input: createHookInput(),
      assertBlocked: (result) => {
        assert.equal(result.status, 2, result.stderr);
        assert.match(result.stderr, /bootstrap failed/i);
      },
    },
  ];

  for (const { eventName, input, assertBlocked } of cases) {
    const handler = hooks.hooks[eventName][0].hooks[0];
    const command = process.platform === 'win32' ? handler.commandWindows : handler.command;
    const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
    const args =
      process.platform === 'win32' ? ['-NoProfile', '-Command', command] : ['-c', command];
    const result = spawnSync(shell, args, {
      cwd: tmpdir(),
      encoding: 'utf8',
      input: JSON.stringify(input),
      timeout: 3000,
    });

    if (eventName !== 'PreToolUse') {
      assert.equal(result.status, 0, `${eventName}: ${result.stderr}`);
    }
    assertBlocked(result);
  }
});

test('Claude SessionStart injects only the active-plan index', () => {
  const settings = JSON.parse(readFileSync(resolve(REPO_ROOT, '.claude/settings.json'), 'utf8'));
  const command = settings.hooks.SessionStart[0].hooks[0].command;

  assert.doesNotMatch(command, /readFileSync/);
  const output = execFileSync(process.execPath, ['-e', command.slice("node -e '".length, -1)], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  assert.ok(output.length < 1000, `SessionStart output is ${output.length} characters`);
});
