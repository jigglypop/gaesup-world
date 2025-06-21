import { SERVER_URL } from '@constants/url';
import { threeObjectResponseType } from '@store/threeObject/type';
import APIBuilder from './boilerplate/builder';

export const getThreeObjects = async () => {
  const api = APIBuilder.get('/three_object').baseURL(SERVER_URL).setAuth().build();
  const result = await api.call<threeObjectResponseType>();
  const { data } = result;
  return data;
};
