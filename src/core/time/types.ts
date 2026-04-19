export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export type GameTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: Weekday;
  season: Season;
  totalMinutes: number;
};

export type TimeMode = 'scaled' | 'realtime';

export type TimeConfig = {
  mode: TimeMode;
  scale: number;
  startEpochMs: number;
};

export type TimeSerialized = {
  version: number;
  totalMinutes: number;
  startEpochMs: number;
  mode: TimeMode;
  scale: number;
  pausedAt: number | null;
};
