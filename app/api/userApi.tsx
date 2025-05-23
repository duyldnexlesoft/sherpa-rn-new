import {del, get, post, put} from 'app/utils/baseApi';
import {omit} from 'lodash';

export const getUsers = () => {
  return get('/api/v1/users');
};
export const login = (payload: any) => {
  return post('/api/user/v1/login', payload);
};
export const logout = () => {
  return put('/api/user/v1/logout');
};
export const signup = (payload: any) => {
  return post('/api/user/v1/signup', payload);
};
export const getProfile = (id: any) => {
  return get('/api/user/v1/getDetails/' + id);
};
export const updateUser = (payload: any) => {
  return put('/api/user/v1/update', payload);
};
export const changePassword = (payload: any) => {
  return put('/api/user/v1/changePassword', payload);
};
export const uploadImage = (payload: any) => {
  return post('/api/user/v1/uploadImage', payload, {'Content-Type': 'multipart/form-data;'});
};
export const deleteImage = (payload: any) => {
  return put('/api/user/v1/deleteImage', payload);
};
export const changeImageIndex = (payload: any) => {
  return put('/api/user/v1/changeImageIndex', payload);
};
export const setFavorite = (payload: any) => {
  return put('/api/user/v1/favorite', payload);
};
export const deleteUser = () => {
  return del('/api/user/v1/deleteUser');
};
export const generatePasswordCode = (payload: any) => {
  return put('/api/user/v1/generatePasswordCode', payload);
};
export const checkPasswordCode = (payload: any) => {
  return post('/api/user/v1/checkPasswordCode', payload);
};
export const resetPassword = (payload: any) => {
  return put('/api/user/v1/resetPassword?token=' + payload.token, omit(payload, 'token'));
};
export const resendVerifyAccountLink = (email: any) => {``
  return get('/api/common/v1/resendVerifyAccountLink?email=' + encodeURIComponent(email));
};
export const updateFCMToken = (fcmToken: any) => {
  return put('/api/common/v1/updateFCMToken', {fcmToken});
};
export const checkNotice = () => {
  return get('/api/user/v1/checkNotice');
};
