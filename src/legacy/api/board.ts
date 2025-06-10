import { SERVER_URL } from "@constants/url";

import { boardMap, boardRequestType } from "@store/board/type";
import APIBuilder from "./boilerplate/builder";

export const getBoards = async () => {
  const api = APIBuilder.get("/board").baseURL(SERVER_URL).build();
  const result = await api.call<boardMap>();
  const { data } = result;
  return data;
};

export const postBoard = async (board: boardRequestType) => {
  const api = APIBuilder.post("/board", board)
    .baseURL(SERVER_URL)
    .setAuth()
    .build();
  const result = await api.call<boardMap>();
  const { data } = result;
  return data;
};
