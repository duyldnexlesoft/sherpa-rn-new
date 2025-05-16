import {get, post} from 'app/utils/baseApi';

export const generateHmac = (payload: any) => {
  return post('/api/intercom/v1/generate-hmac', payload);
};

export const getIntercomContact = async () => {
  return get('/api/intercom/v1/contact');
};
