import {get, post} from 'app/utils/baseApi';

export const getConversations = (query: any) => {
  return get('/api/messages/v1/getConversations', query);
};

export const createConversation = (payload: any) => {
  return post('/api/messages/v1/createConversation', payload);
};

export const getMessages = (query: any) => {
  return get('/api/messages/v1/getMessages', query);
};

export const createMessage = (payload: any) => {
  return post('/api/messages/v1/createMessage', payload, {'Content-Type': 'multipart/form-data;'});
};
