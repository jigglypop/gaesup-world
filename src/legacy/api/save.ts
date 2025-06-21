import { SERVER_URL } from '@constants/url';
import { npcType } from '@store/npc/type';
import { portalType } from '@store/portal/type';
import {
  saveNpcRequestType,
  savePortalRequestType,
  saveThreeObjectRequestType,
  saveTileRequestType,
  saveWallRequestType,
} from '@store/save/type';
import { threeObjectType } from '@store/threeObject/type';
import { tileType } from '@store/tile/type';
import { wallType } from '@store/wall/type';
import APIBuilder from './boilerplate/builder';

export const postThreeObjecSaveRoom = async (request: saveThreeObjectRequestType) => {
  const api = APIBuilder.post(`/three_object/save`, request).baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<threeObjectType[]>();
  const { data } = result;
  return data;
};

export const postNpcSaveRoom = async (request: saveNpcRequestType) => {
  const api = APIBuilder.post(`/npc/save`, request).baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<npcType[]>();
  const { data } = result;
  return data;
};

export const postTileSaveRoom = async (request: saveTileRequestType) => {
  const api = APIBuilder.post(`/tile/save`, request).baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<tileType[]>();
  const { data } = result;
  return data;
};

export const postWallSaveRoom = async (request: saveWallRequestType) => {
  const api = APIBuilder.post(`/wall/save`, request).baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<wallType[]>();
  const { data } = result;
  return data;
};

export const postPortalSaveRoom = async (request: savePortalRequestType) => {
  const api = APIBuilder.post(`/portal/save`, request).baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<portalType[]>();
  const { data } = result;
  return data;
};
