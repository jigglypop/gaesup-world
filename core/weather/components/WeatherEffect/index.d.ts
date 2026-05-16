import React from 'react';
import type { WeatherKind } from '../../types';
export type WeatherEffectKind = Extract<WeatherKind, 'rain' | 'snow' | 'storm'> | 'wind';
export type WeatherEffectProps = {
    area?: number;
    height?: number;
    count?: number;
    kind?: WeatherEffectKind;
    followCamera?: boolean;
};
export declare function WeatherEffect({ area, height, count, kind: forcedKind, followCamera, }: WeatherEffectProps): React.JSX.Element | null;
export default WeatherEffect;
