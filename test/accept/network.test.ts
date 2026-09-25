/** @jest-environment jsdom */
import { acceptScenario } from './scenario';
import { body, resting, streamUpdates, installWireSocket, walking, WIRE_STREAM_SECONDS } from '../support/multiplayerWire';

jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: (selector: (state: object) => unknown) => selector({}),
}));

installWireSocket();

acceptScenario('S-H13', () => {
  const resting10s = streamUpdates(body(resting));
  const moving = streamUpdates(body(walking));
  return {
    restingUpdatesPerSecond: resting10s.length / WIRE_STREAM_SECONDS,
    // The first Update carries identity; the budget is for the steady stream after it.
    maxMovingUpdateBytes: Math.max(...moving.slice(1).map((raw) => raw.length)),
  };
});
