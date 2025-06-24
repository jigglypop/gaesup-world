import { ModeType } from '../../stores/types';
import { ActiveStateType } from '../../motions/core/types';
import { ResourceUrlsType } from '../../motions/entities/types';

export type gaesupPassivePropsType = {
  state: ActiveStateType | null;
  mode: ModeType | null;
  urls: ResourceUrlsType;
  currentAnimation: string;
  children?: React.ReactNode;
};
