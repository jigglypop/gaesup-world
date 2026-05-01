import type { BlueprintRecord } from '../../../types';

export type BlueprintType =
  | 'character'
  | 'vehicle'
  | 'airplane'
  | 'animation'
  | 'behavior'
  | 'item';

export type BlueprintCategory = {
  id: string;
  name: string;
  type: BlueprintType;
  count: number;
};

export type BlueprintItem = {
  id: string;
  name: string;
  type: BlueprintType;
  version: string;
  tags: string[];
  description: string;
  lastModified: string;
};

export type BlueprintFieldValue = string | number | boolean | string[] | BlueprintRecord;