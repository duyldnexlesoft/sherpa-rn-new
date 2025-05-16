import {del, get, post} from 'app/utils/baseApi';

export const getCards = () => {
  return get('/api/card/v1/getList');
};

export const attachCard = (payload: any) => {
  return post('/api/card/v1/attach', payload);
};

export const deleteCard = (cardId: any) => {
  return del('/api/card/v1/delete/' + cardId);
};
