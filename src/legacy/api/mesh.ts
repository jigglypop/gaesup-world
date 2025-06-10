import { SERVER_URL } from "@constants/url";
import { meshMap, meshType } from "@store/mesh/type";
import APIBuilder from "./boilerplate/builder";

export const getMeshes = async () => {
  const api = APIBuilder.get("/mesh").baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<meshMap>();
  const { data } = result;
  return data;
};

export const postMesh = async (mesh: meshType) => {
  const api = APIBuilder.post("/mesh", mesh)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<meshMap>();
  const { data } = result;
  return data;
};

export const patchMesh = async (mesh: meshType) => {
  const api = APIBuilder.patch(`/mesh`, mesh)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<meshMap>();
  const { data } = result;
  return data;
};
