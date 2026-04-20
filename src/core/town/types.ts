export type ResidentId = string;
export type HouseId = string;

export type Resident = {
  id: ResidentId;
  name: string;
  npcId?: string;
  movedInDay?: number;
  hatColor?: string;
  bodyColor?: string;
};

export type HousePlotState = 'empty' | 'reserved' | 'occupied';

export type HousePlot = {
  id: HouseId;
  position: [number, number, number];
  size: [number, number];
  state: HousePlotState;
  residentId?: ResidentId;
  reservedFor?: ResidentId;
  reservedUntilDay?: number;
};

export type TownStats = {
  decorationScore: number;
  residentCount: number;
  occupiedHouses: number;
  totalHouses: number;
};

export type TownSerialized = {
  version: number;
  houses: HousePlot[];
  residents: Resident[];
};
