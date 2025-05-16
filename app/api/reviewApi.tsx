import {get, post} from 'app/utils/baseApi';

export const getListReview = (query: any) => {
  return get('/api/review/v1/getList', query);
};

export const createReview = (payload: any) => {
  return post('/api/review/v1/create', payload);
};