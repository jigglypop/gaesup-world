import { passivePropsType } from '../types';

export type passiveAirplanePropsType = Omit<passivePropsType, 'componentType'>;
