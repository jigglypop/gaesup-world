import type { ReactNode } from 'react';

import type { CameraOptionType, CameraType } from '../../../camera';
import type { GaesupRuntime } from '../../../runtime';
import type { ModeState } from '../../../stores/slices/mode';
import type { UrlsState } from '../../../stores/slices/urls/types';

export type WorldAssetUrls = Partial<UrlsState> & Partial<{
  character: string;
  vehicle: string;
  airplane: string;
}>;

export type WorldCameraOption = Pick<CameraOptionType,
  | 'xDistance'
  | 'yDistance'
  | 'zDistance'
  | 'fov'
  | 'zoom'
  | 'enableZoom'
  | 'minZoom'
  | 'maxZoom'
  | 'zoomSpeed'
  | 'enableCollision'
  | 'dragOrbit'
> & {
  type: CameraType;
  /** Orbit distance the x/z distances default to (15). */
  distance?: number;
  height?: number;
  smoothness?: number;
};

export interface WorldContainerProps {
  children?: ReactNode;
  runtime?: GaesupRuntime;
  runtimeRevision?: number;
  urls?: WorldAssetUrls;
  cameraOption?: WorldCameraOption;
  mode?: Partial<ModeState> & Pick<ModeState, 'type'>;
}
