import { SERVER_URL } from "@constants/url";
import { wallType } from "@store/wall/type";
import {
  newWallParentType,
  wallParentRequestType,
  wallParentResponseType,
} from "@store/wallParent/type";
import APIBuilder from "./boilerplate/builder";

export const getWallParent = async () => {
  const api = APIBuilder.get("/wallparent")
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<wallParentResponseType>();
  const { data } = result;
  return data;
};

export const postWallParent = async (wallParent: wallParentRequestType) => {
  const api = APIBuilder.post("/wallparent", wallParent)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<wallParentResponseType>();
  const { data } = result;
  return data;
};

export const patchWallParent = async (wallParent: newWallParentType[]) => {
  const api = APIBuilder.patch(`/wallparent`, wallParent)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<wallParentResponseType>();
  const { data } = result;
  return data;
};

export const removeWallParent = async (id: string) => {
  const api = APIBuilder.delete(`/wallparent/${id}`, [])
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<wallParentResponseType>();
  const { data } = result;
  return data;
};

export const getWalls = async () => {
  const api = APIBuilder.get("/wall").baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<wallType[]>();
  const { data } = result;
  return data;
};

export const updateWalls = async (walls: wallType[]) => {
  const api = APIBuilder.patch("/wall", JSON.stringify(walls))
    .baseURL(SERVER_URL)
    .build();
  const result = await api.call<wallType[]>();
  const { data } = result;
  return data;
};
