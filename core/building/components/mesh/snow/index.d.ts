import React from 'react';
type SnowProps = {
    /**
     * When true, simulation runs entirely in the vertex shader (zero CPU cost).
     * Disables WASM/JS update path. Recommended for static, area-bound snowfall.
     */
    gpu?: boolean;
    /**
     * Keep the particle volume centered on the active camera. Disabled by default
     * so editor camera controls do not drag world snow around.
     */
    followCamera?: boolean;
};
export declare function Snow({ gpu, followCamera }?: SnowProps): React.JSX.Element;
declare const _default: React.MemoExoticComponent<typeof Snow>;
export default _default;
