import { SERVER_URL } from "@constants/url";
import APIBuilder from "./boilerplate/builder";
import { IUploadResponse } from "./type";

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const api = APIBuilder.post("/images", formData)
    .baseURL(SERVER_URL)
    .setAuth()
    .headers({ "Content-Type": "multipart/form-data" })
    .build();

  const result = await api.call<IUploadResponse>();
  return result.data;
};

export const deleteImage = async (url: string) => {
  const api = APIBuilder.delete("/images", {
    imageName: url,
  })
    .baseURL(SERVER_URL)
    .setAuth()
    .build();

  const result = await api.call<IUploadResponse>();
  return result.data;
};
