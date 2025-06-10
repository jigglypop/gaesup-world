import { SERVER_URL } from "@constants/url";
import { infoMap } from "@store/info/type";
import APIBuilder from "./boilerplate/builder";

export const getInfos = async () => {
  const api = APIBuilder.get("/info").baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<infoMap>();
  const { data } = result;
  return data;
};
