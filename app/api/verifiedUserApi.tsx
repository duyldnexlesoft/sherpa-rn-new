import {get, post, put} from 'app/utils/baseApi';
import _ from 'lodash';

export const verifiedUser = (body: any) => {
  return post('/api/verifiedUser/v1', body);
};
export const createSherpaUser = (payload: any) => {
  return put('/api/verifiedUser/v1/create?token=' + payload.token, _.omit(payload, 'token'));
};
export const checkSherpaQueryToken = (token: any) => {
  return get('/api/common/v1/checkSherpaQueryToken' + token);
};
export const getShepas = (query: any) => {
  return get('/api/verifiedUser/v1/getShepas', query);
};