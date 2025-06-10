export type infoType = {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  content: string;
};

export type infoMap = {
  [key: string]: infoType;
};
