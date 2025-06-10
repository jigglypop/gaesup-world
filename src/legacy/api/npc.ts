import { SERVER_URL } from "@constants/url";
import {
  npcAndThreeObjectsResponseType,
  npcResponseType,
  npcType,
} from "@store/npc/type";
import APIBuilder from "./boilerplate/builder";

export const getNpcs = async () => {
  const api = APIBuilder.get("/npc").baseURL(SERVER_URL).build();
  const result = await api.call<npcAndThreeObjectsResponseType>();
  const { data } = result;
  return data;
};

export const postNpc = async (npc: npcType[]) => {
  const api = APIBuilder.post("/npc", npc)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<npcResponseType>();
  const { data } = result;
  return data;
};

export const removeNpc = async (npc: npcType[]) => {
  const api = APIBuilder.delete("/npc", npc)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<npcResponseType>();
  const { data } = result;
  return data;
};
