import {post} from 'app/utils/baseApi';

export const sendMailToSupport = (body: any) => {
  return post('/api/support/v1', body);
};
