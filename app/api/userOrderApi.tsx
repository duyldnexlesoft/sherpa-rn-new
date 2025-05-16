import {get, post, put} from 'app/utils/baseApi';

export const createUserOrder = (payload: any) => {
  return post('/api/userOrder/v1/create', payload);
};

export const updateUserOrder = (payload: any) => {
  return put('/api/userOrder/v1/update', payload);
};

export const cancelUserOrder = (payload: any) => {
  return post('/api/userOrder/v1/cancel', payload);
};

export const getUserOrders = (query: any) => {
  return get('/api/userOrder/v1/getList', query);
};

export const createPaymentIntent = (payload: any) => {
  return post('/api/userOrder/v1/createPaymentIntent', payload);
};

export const createEphemeralKeys = () => {
  return post('/api/userOrder/v1/createEphemeralKeys');
};

export const checkout = (payload: any) => {
  return post('/api/userOrder/v1/checkout', payload);
};

export const checkPromoCode = (payload: any) => {
  return post('/api/userOrder/v1/checkPromoCode', payload);
};
