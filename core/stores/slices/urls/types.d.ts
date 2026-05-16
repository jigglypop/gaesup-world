export interface UrlsState {
    characterUrl?: string;
    vehicleUrl?: string;
    airplaneUrl?: string;
    wheelUrl?: string;
    ridingUrl?: string;
}
export interface UrlsSlice {
    urls: UrlsState;
    setUrls: (update: Partial<UrlsState>) => void;
}
