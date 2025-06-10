import { SERVER_URL } from "@constants/url";
import { portalType } from "@store/portal/type";

import APIBuilder from "./boilerplate/builder";

export const getPortals = async () => {
  const api = APIBuilder.get("/portal").baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<portalType[]>();
  const { data } = result;
  return data;
};

export const updatePortals = async (portals: portalType[]) => {
  const api = APIBuilder.patch("/portal", JSON.stringify(portals))
    .baseURL(SERVER_URL)
    .build();
  const result = await api.call<portalType[]>();
  const { data } = result;
  return data;
};
