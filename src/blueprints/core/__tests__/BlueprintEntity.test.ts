import type { RefObject } from 'react';
import type { RapierRigidBody } from '@react-three/rapier';

import { BlueprintEntity } from '../BlueprintEntity';
import { ComponentRegistry } from '../ComponentRegistry';
import type { BlueprintDefinition, IComponent } from '../types';

const DEFINITION: BlueprintDefinition = {
  id: 'test',
  name: 'test',
  type: 'character',
  components: [],
};
const BODY = { current: null } as unknown as RefObject<RapierRigidBody>;
const createComponent = (type: string): IComponent => ({
  type,
  enabled: true,
  initialize: jest.fn(),
  update: jest.fn(),
  dispose: jest.fn(),
});

test('failed construction releases initialized and partially initialized components', () => {
  const registry = ComponentRegistry.getInstance();
  const first = createComponent('first');
  const second = createComponent('second');
  const failure = new Error('initialization failed');
  jest.mocked(second.initialize).mockImplementation(() => {
    throw failure;
  });
  jest.mocked(first.dispose).mockImplementation(() => {
    throw new Error('cleanup failed');
  });
  registry.register('first', () => first);
  registry.register('second', () => second);
  try {
    expect(
      () =>
        new BlueprintEntity(
          {
            ...DEFINITION,
            components: ['first', 'second'].map((type) => ({
              type,
              enabled: true,
              properties: {},
            })),
          },
          BODY,
        ),
    ).toThrow(failure);
    expect(first.dispose).toHaveBeenCalledTimes(1);
    expect(second.dispose).toHaveBeenCalledTimes(1);
  } finally {
    registry.clear();
  }
});

test('a failing disposer cannot retain or block disposal of other components', () => {
  const entity = new BlueprintEntity(DEFINITION, BODY);
  const first = createComponent('first');
  const second = createComponent('second');
  entity.addComponent(first);
  entity.addComponent(second);
  jest.mocked(first.dispose).mockImplementation(() => {
    throw new Error('cleanup failed');
  });
  expect(() => entity.dispose()).toThrow();
  expect(second.dispose).toHaveBeenCalledTimes(1);
  expect(entity.getComponent('first')).toBeUndefined();
  entity.update(1 / 60);
  expect(second.update).not.toHaveBeenCalled();
  expect(() => entity.dispose()).not.toThrow();
  expect(first.dispose).toHaveBeenCalledTimes(1);
});
