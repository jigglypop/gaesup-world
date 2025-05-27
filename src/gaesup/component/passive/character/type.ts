import { passivePropsType } from '../type';

export type passiveCharacterPropsType = Omit<
  passivePropsType,
  'isRiding' | 'enableRiding' | 'componentType'
>;
