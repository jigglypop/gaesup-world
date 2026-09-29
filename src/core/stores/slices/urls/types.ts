export type UrlsState = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  wheelUrl?: string;
  ridingUrl?: string;
};

export type UrlsSlice = {
  urls: UrlsState;
  setUrls: (update: Partial<UrlsState>) => void;
};
