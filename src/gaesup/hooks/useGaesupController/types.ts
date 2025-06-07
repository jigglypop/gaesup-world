import { ActiveStateType, ModeType, ResourceUrlsType } from '../../types';

export type gaesupPassivePropsType = {
  state: ActiveStateType | null;
  mode: ModeType | null;
  urls: ResourceUrlsType;
  currentAnimation: string;
  children?: React.ReactNode;
};
