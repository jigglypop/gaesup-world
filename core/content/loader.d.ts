import type { ContentBundle, ContentBundleManifest, ContentBundleSource, ContentBundleValidation } from './types';
export declare function validateContentBundleManifest(manifest: ContentBundleManifest): ContentBundleValidation;
export declare function validateContentBundle(bundle: ContentBundle): ContentBundleValidation;
export declare function loadContentBundleFromManifest(manifest: ContentBundleManifest, fetcher?: typeof fetch, baseUrl?: string): Promise<ContentBundle>;
export declare class HttpContentBundleSource implements ContentBundleSource {
    private readonly baseUrl;
    private readonly fetcher;
    constructor(baseUrl: string, fetcher?: typeof fetch);
    loadBundle(id: string): Promise<ContentBundle>;
}
