export interface UrlsState {
  characterUrl: string | null;
  vehicleUrl: string | null;
  airplaneUrl: string | null;
  wheelUrl: string | null;
  ridingUrl: string | null;
}

export interface UrlsSlice {
  urls: UrlsState;
  setUrls: (update: Partial<UrlsState>) => void;
}
