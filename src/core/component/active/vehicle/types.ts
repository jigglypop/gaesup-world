import { innerRefType } from '../../passive/types';
import { passiveVehiclePropsType } from '../../passive/vehicle/types';

export type activeVehicleInnerType = passiveVehiclePropsType & innerRefType;
