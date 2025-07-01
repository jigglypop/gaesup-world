import { passivePropsType } from '../types';

export type passiveVehiclePropsType = Omit<passivePropsType, 'componentType'>;
