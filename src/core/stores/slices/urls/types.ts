export type UrlsState = {
  characterUrl?: string;
  vehicleUrl?: string;
  airplaneUrl?: string;
  ridingUrl?: string;
};

export type UrlsSlice = {
  urls: UrlsState;
  setUrls: (update: Partial<UrlsState>) => void;
};
