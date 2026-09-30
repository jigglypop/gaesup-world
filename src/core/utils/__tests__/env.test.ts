import { isProductionEnv, readNodeEnv } from '../env';

const original = process.env['NODE_ENV'];

afterEach(() => {
  if (original === undefined) delete process.env['NODE_ENV'];
  else process.env['NODE_ENV'] = original;
});

test('NODE_ENV를 호출 시점에 읽어 소비자 환경을 따른다', () => {
  expect(readNodeEnv()).toBe('test');
  expect(isProductionEnv()).toBe(false);
  process.env['NODE_ENV'] = 'production';
  expect(isProductionEnv()).toBe(true);
});
