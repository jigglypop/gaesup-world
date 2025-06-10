export interface Response<T> {
  data: T;
  status: string;
  serverDateTime: string;
  errorCode: number;
  errorMessage: string;
}

export type objectsType = any[];
export interface IUploadResponse {
  message: string;
  imageUrl: string;
}
