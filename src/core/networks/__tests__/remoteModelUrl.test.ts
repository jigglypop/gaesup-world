import { isTrustedRemoteModelUrl } from '../core/remoteInputLimits';

const PAGE = 'https://game.example/world/';
const ALLOWED = ['https://cdn.example.com/models/'];

test.each([
  '/\\evil.com/a.glb', '/\t/evil.com/a.glb', '//evil.com/a.glb', ' javascript:alert(1)', 'java\tscript:alert(1)',
  'data:model/gltf-binary;base64,AAAA', 'https://cdn.example.com.evil.net/models/a.glb',
  'https://cdn.example.com/models/../secret.glb', 'https://cdn.example.com/models-x/a.glb',
])('a remote avatar does not load %j', (url) => {
  expect(isTrustedRemoteModelUrl(url, ALLOWED, PAGE)).toBe(false);
});

test.each(['/gltf/ally.glb', 'ally.glb', 'https://game.example/gltf/ally.glb', 'https://cdn.example.com/models/a.glb'])(
  'a remote avatar loads %j', (url) => {
    expect(isTrustedRemoteModelUrl(url, ALLOWED, PAGE)).toBe(true);
  },
);

test('an allowed origin without a path allows its whole origin', () => {
  expect(isTrustedRemoteModelUrl('https://cdn.example.com/any/a.glb', ['https://cdn.example.com'], PAGE)).toBe(true);
  expect(isTrustedRemoteModelUrl('https://cdn.example.com/any/a.glb', [], PAGE)).toBe(false);
});
