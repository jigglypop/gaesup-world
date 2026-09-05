import { getFrameTimeMs } from '../frameTime';

test('uses scheduler seconds before the legacy clock and converts to milliseconds', () => {
  expect(getFrameTimeMs({ elapsed: 0, clock: { elapsedTime: 99 } })).toBe(0);
  expect(getFrameTimeMs({ elapsed: 1.25 })).toBe(1250);
  expect(getFrameTimeMs({ clock: { elapsedTime: 1.25 } })).toBe(1250);
});

test('falls back to a monotonic timestamp when renderer timing is absent', () => {
  const now = jest.spyOn(performance, 'now').mockReturnValue(1200);
  try {
    expect(getFrameTimeMs({})).toBe(1200);
  } finally {
    now.mockRestore();
  }
});
