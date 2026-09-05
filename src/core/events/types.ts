import type { Season } from '../time/types';

export type EventId = string;

export type EventTrigger =
  | { kind: 'season'; seasons: Season[] }
  | { kind: 'monthDay'; month: number; day: number }
  | { kind: 'monthRange'; month: number; fromDay: number; toDay: number }
  | { kind: 'weekday'; weekdays: ReadonlyArray<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> }
  | { kind: 'always' };

export type EventDef = {
  id: EventId;
  name: string;
  summary?: string;
  triggers: EventTrigger[];
  tags?: string[];
};

export type EventState = {
  active: EventId[];
  startedAt: Record<EventId, number>;
};

export type EventsSerialized = {
  version: number;
  active: EventId[];
  startedAt: Record<EventId, number>;
};
