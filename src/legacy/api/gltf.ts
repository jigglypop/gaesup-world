import { SERVER_URL } from "@constants/url";
import { gltfListAtomType } from "@store/gltfList/type";
import { tokenAsync } from "./auth";
import APIBuilder from "./boilerplate/builder";

export const getGltfList = async () => {
  const token = await tokenAsync();
  if (!token) return false;
  const api = APIBuilder.get("/gltf")
    .baseURL(SERVER_URL)
    .headers({ Authorization: `Bearer ${token}` })
    .build();
  const result = await api.call<gltfListAtomType>();
  const { data } = result;
  return data;
};
