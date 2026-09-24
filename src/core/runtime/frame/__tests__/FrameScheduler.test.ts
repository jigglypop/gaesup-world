import { setErrorSink } from '../../../utils/reportError';
import { createFrameDriver } from '../createFrameDriver';
import { FrameScheduler } from '../FrameScheduler';

describe('FrameScheduler', () => {
  test('단계 순서와 단계 안의 order 순서로 실행한다', () => {
    const scheduler = new FrameScheduler();
    const calls: string[] = [];
    scheduler.add('camera', () => calls.push('camera'));
    scheduler.add('input', () => calls.push('input-late'), { order: 10 });
    scheduler.add('input', () => calls.push('input-early'), { order: -1 });
    scheduler.add('animation', () => calls.push('animation'));
    scheduler.tick(1 / 60, 0);
    expect(calls).toEqual(['input-early', 'input-late', 'animation', 'camera']);
  });

  test('실행 중 해제와 등록은 다음 틱부터 반영한다', () => {
    const scheduler = new FrameScheduler();
    const calls: string[] = [];
    let unsubscribeSecond: () => void = () => undefined;
    scheduler.add('script', () => {
      calls.push('first');
      unsubscribeSecond();
      scheduler.add('script', () => calls.push('added'));
    });
    unsubscribeSecond = scheduler.add('script', () => calls.push('second'));
    scheduler.tick(0.016, 0);
    expect(calls).toEqual(['first']);
    calls.length = 0;
    scheduler.clear();
    expect(scheduler.count()).toBe(0);
  });

  test('예외가 난 콜백도 다음 프레임에 계속 실행하고, 보고는 항목별로 제한한다', () => {
    const scheduler = new FrameScheduler();
    const healthy = jest.fn();
    const failing = jest.fn(() => {
      throw new Error('boom');
    });
    const reports = jest.fn();
    const release = setErrorSink(reports);
    scheduler.add('effects', failing, { label: 'fx' });
    scheduler.add('effects', healthy);
    scheduler.tick(0.016, 0);
    scheduler.tick(0.016, 16);
    scheduler.tick(0.016, 1100);
    release();
    expect(healthy).toHaveBeenCalledTimes(3);
    expect(failing).toHaveBeenCalledTimes(3);
    expect(reports).toHaveBeenCalledTimes(2);
    expect(reports).toHaveBeenLastCalledWith(new Error('boom'), { source: 'frame', label: 'fx', suppressed: 1 });
  });

  test('throttle과 enabled 조건을 적용한다', () => {
    const scheduler = new FrameScheduler();
    const throttled = jest.fn();
    let enabled = false;
    const gated = jest.fn();
    scheduler.add('snapshot', throttled, { throttleMs: 100 });
    scheduler.add('snapshot', gated, { enabled: () => enabled });
    scheduler.tick(0.016, 0);
    scheduler.tick(0.016, 50);
    scheduler.tick(0.016, 120);
    enabled = true;
    scheduler.tick(0.016, 130);
    expect(throttled).toHaveBeenCalledTimes(2);
    expect(gated).toHaveBeenCalledTimes(1);
  });

  test('계측을 켜면 단계별 호출 수를 누적한다', () => {
    const scheduler = new FrameScheduler();
    scheduler.add('camera', () => undefined);
    scheduler.tick(0.016, 0);
    expect(scheduler.getMetrics('camera').calls).toBe(0);
    scheduler.setMetricsEnabled(true);
    scheduler.tick(0.016, 16);
    expect(scheduler.getMetrics('camera').calls).toBe(1);
    scheduler.resetMetrics();
    expect(scheduler.getMetrics('camera').calls).toBe(0);
  });
});

describe('createFrameDriver', () => {
  test('항목이 있을 때만 콜백 하나를 등록하고 모든 항목을 순회한다', () => {
    const scheduler = new FrameScheduler();
    const updated: string[] = [];
    const driver = createFrameDriver<string>('effects', (item) => updated.push(item), {}, scheduler);
    expect(scheduler.count('effects')).toBe(0);
    const removeA = driver.add('a');
    const removeB = driver.add('b');
    expect(scheduler.count('effects')).toBe(1);
    scheduler.tick(0.016, 0);
    expect(updated).toEqual(['a', 'b']);
    removeA();
    removeA();
    expect(driver.size()).toBe(1);
    removeB();
    expect(scheduler.count('effects')).toBe(0);
  });
});

describe('FrameScheduler recovery', () => {
  test('시계가 뒤로 가면 throttle 대기 없이 다시 실행한다', () => {
    const scheduler = new FrameScheduler();
    const throttled = jest.fn();
    scheduler.add('effects', throttled, { throttleMs: 100 });
    scheduler.tick(0.016, 5000);
    scheduler.tick(0.016, 20);
    scheduler.tick(0.016, 60);
    expect(throttled).toHaveBeenCalledTimes(2);
  });

  test('clear 뒤에도 드라이버가 다시 등록된다', () => {
    const scheduler = new FrameScheduler();
    const update = jest.fn();
    const driver = createFrameDriver<number>('effects', update, {}, scheduler);
    driver.add(1);
    scheduler.clear();
    driver.add(2);
    scheduler.tick(0.016, 0);
    expect(update).toHaveBeenCalledTimes(2);
  });
});
