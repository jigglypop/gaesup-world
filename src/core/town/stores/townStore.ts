import { create } from 'zustand';

import { notify } from '../../ui/components/Toast/toastStore';
import type {
  HouseId,
  HousePlot,
  Resident,
  ResidentId,
  TownSerialized,
  TownStats,
} from '../types';

type State = {
  houses: Record<HouseId, HousePlot>;
  residents: Record<ResidentId, Resident>;
  decorationScore: number;

  registerHouse: (input: Pick<HousePlot, 'id' | 'position'> & Partial<Omit<HousePlot, 'id' | 'position'>>) => void;
  unregisterHouse: (id: HouseId) => void;

  registerResident: (resident: Resident) => void;
  removeResident: (id: ResidentId) => void;

  reserveHouse: (houseId: HouseId, residentId: ResidentId, untilDay?: number) => boolean;
  cancelReservation: (houseId: HouseId) => void;
  moveIn: (houseId: HouseId, residentId: ResidentId, gameDay: number) => boolean;
  moveOut: (houseId: HouseId) => boolean;

  setDecorationScore: (score: number) => void;
  stats: () => TownStats;

  serialize: () => TownSerialized;
  hydrate: (data: TownSerialized | null | undefined) => void;
};

function emptyHouse(id: HouseId, position: [number, number, number]): HousePlot {
  return { id, position, size: [4, 4], state: 'empty' };
}

export const useTownStore = create<State>((set, get) => ({
  houses: {},
  residents: {},
  decorationScore: 0,

  registerHouse: (input) => {
    const cur = get().houses[input.id];
    if (cur) return;
    const next: HousePlot = { ...emptyHouse(input.id, input.position), ...input };
    set({ houses: { ...get().houses, [input.id]: next } });
  },

  unregisterHouse: (id) => {
    const cur = { ...get().houses };
    if (!cur[id]) return;
    delete cur[id];
    set({ houses: cur });
  },

  registerResident: (resident) => {
    if (get().residents[resident.id]) return;
    set({ residents: { ...get().residents, [resident.id]: resident } });
  },

  removeResident: (id) => {
    const cur = { ...get().residents };
    if (!cur[id]) return;
    delete cur[id];
    set({ residents: cur });
    for (const h of Object.values(get().houses)) {
      if (h.residentId === id) get().moveOut(h.id);
      if (h.reservedFor === id) get().cancelReservation(h.id);
    }
  },

  reserveHouse: (houseId, residentId, untilDay) => {
    const h = get().houses[houseId];
    if (!h || h.state !== 'empty') return false;
    set({
      houses: {
        ...get().houses,
        [houseId]: { ...h, state: 'reserved', reservedFor: residentId, reservedUntilDay: untilDay },
      },
    });
    return true;
  },

  cancelReservation: (houseId) => {
    const h = get().houses[houseId];
    if (!h || h.state !== 'reserved') return;
    const next: HousePlot = { ...h, state: 'empty' };
    delete next.reservedFor;
    delete next.reservedUntilDay;
    set({ houses: { ...get().houses, [houseId]: next } });
  },

  moveIn: (houseId, residentId, gameDay) => {
    const h = get().houses[houseId];
    const r = get().residents[residentId];
    if (!h || !r) return false;
    if (h.state === 'occupied') return false;
    set({
      houses: {
        ...get().houses,
        [houseId]: { ...h, state: 'occupied', residentId, reservedFor: undefined, reservedUntilDay: undefined },
      },
      residents: {
        ...get().residents,
        [residentId]: { ...r, movedInDay: gameDay },
      },
    });
    notify('reward', `${r.name}이(가) 이사 왔다!`);
    return true;
  },

  moveOut: (houseId) => {
    const h = get().houses[houseId];
    if (!h || h.state !== 'occupied') return false;
    const r = h.residentId ? get().residents[h.residentId] : null;
    set({
      houses: {
        ...get().houses,
        [houseId]: emptyHouse(houseId, h.position),
      },
    });
    if (r) notify('info', `${r.name}이(가) 떠났다`);
    return true;
  },

  setDecorationScore: (score) => set({ decorationScore: Math.max(0, Math.floor(score)) }),

  stats: (): TownStats => {
    const houses = Object.values(get().houses);
    const occupied = houses.filter((h) => h.state === 'occupied').length;
    return {
      decorationScore: get().decorationScore,
      residentCount: Object.keys(get().residents).length,
      occupiedHouses: occupied,
      totalHouses: houses.length,
    };
  },

  serialize: (): TownSerialized => ({
    version: 1,
    houses: Object.values(get().houses).map((h) => ({ ...h })),
    residents: Object.values(get().residents).map((r) => ({ ...r })),
  }),

  hydrate: (data) => {
    if (!data) return;
    const houses: Record<HouseId, HousePlot> = {};
    const residents: Record<ResidentId, Resident> = {};
    if (Array.isArray(data.houses)) for (const h of data.houses) if (h?.id) houses[h.id] = { ...h };
    if (Array.isArray(data.residents)) for (const r of data.residents) if (r?.id) residents[r.id] = { ...r };
    set({ houses, residents });
  },
}));
