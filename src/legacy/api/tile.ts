import { SERVER_URL } from "@constants/url";
import { saveRequestType, saveResponseType } from "@store/save/type";
import { tileType } from "@store/tile/type";
import {
  newTileParentType,
  tileParentResponseType,
} from "@store/tileParent/type";
import APIBuilder from "./boilerplate/builder";

export const getTileParent = async () => {
  const api = APIBuilder.get("/tileparent")
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<tileParentResponseType>();
  const { data } = result;
  return data;
};

export const postTileParent = async (tileParent: newTileParentType) => {
  const api = APIBuilder.post("/tileparent", tileParent)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<tileParentResponseType>();
  const { data } = result;
  return data;
};

export const patchTileParent = async (tileParent: newTileParentType[]) => {
  const api = APIBuilder.patch(`/tileparent`, tileParent)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<tileParentResponseType>();
  const { data } = result;
  return data;
};

export const removeTileParent = async (tile_parent_id: string) => {
  const api = APIBuilder.delete(`/tileparent/${tile_parent_id}`, null)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<tileParentResponseType>();
  const { data } = result;
  return data;
};

export const getTiles = async () => {
  const api = APIBuilder.get("/tile").baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<tileType[]>();
  const { data } = result;
  return data;
};

export const updateTiles = async (tiles: tileType[]) => {
  const api = APIBuilder.patch("/tile", JSON.stringify(tiles))
    .baseURL(SERVER_URL)
    .build();
  const result = await api.call<tileType[]>();
  const { data } = result;
  return data;
};

export const postSaveRoom = async (request: saveRequestType) => {
  const api = APIBuilder.post("/save", {
    tile: request.tile,
    wall: request.wall,
    threeObject: request.threeObject,
    npc: request.npc,
  })
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<saveResponseType>();
  const { data } = result;
  return data;
};
