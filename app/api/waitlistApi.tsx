import {get, post} from 'app/utils/baseApi';

export const getWaitlist = () => {
  return get('/api/user/v1/getWaitlist');
};

export const addWaitlist = (payload: any) => {
  return post('/api/user/v1/addWaitlist', payload);
};
