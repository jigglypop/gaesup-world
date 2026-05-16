import type { DeviceCapabilities, PerfProfile, PerfTier } from './types';
declare global {
    interface Navigator {
        deviceMemory?: number;
    }
}
export declare function detectCapabilities(): DeviceCapabilities;
export declare function classifyTier(caps: DeviceCapabilities): PerfTier;
export declare function profileForTier(tier: PerfTier): PerfProfile;
export declare function autoDetectProfile(): {
    profile: PerfProfile;
    capabilities: DeviceCapabilities;
};
