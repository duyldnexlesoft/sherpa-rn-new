import {get} from 'app/utils/baseApi';

export const getAvailability = (userId = '') => {
  return get('/api/availability/v1/get?userId=' + userId);
};
