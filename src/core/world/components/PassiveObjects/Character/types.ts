import { passivePropsType } from '../types';

export type passiveCharacterPropsType = Omit<
  passivePropsType,
  'isRiding' | 'enableRiding' | 'componentType'
>;
