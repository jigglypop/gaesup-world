import { update } from '@/gaesup/utils/context';

describe('context utils', () => {
  it('should call dispatch with update action', () => {
    const dispatch = jest.fn();
    const payload = { foo: 'bar' };
    update(payload, dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'update',
      payload: payload,
    });
  });
});
