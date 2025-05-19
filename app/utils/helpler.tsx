import {Image, Platform} from 'react-native';
import {REVIEW_TYPE, STATUS} from './constants';
import moment from 'moment';
import {cloneDeep, filter, find, floor, isEmpty, map, mean, size, toUpper, trim} from 'lodash';
import {launchImageLibrary} from 'react-native-image-picker';
import Alert from 'app/components/Alert';
import {create} from 'twrnc';
import tailwindConfig from 'tailwind.config';
const newConfig: any = {theme: tailwindConfig.theme};
export const tw = create(newConfig);

export const createFormData = (photo: any, body: any = {}) => {
  const data: any = new FormData();
  data.append('image', {
    name: photo.fileName,
    type: photo.type,
    uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
  });
  Object.keys(body).forEach(key => {
    data.append(key, body[key]);
  });
  return data;
};

export const getStatus = (booking: any) => {
  let status: any = booking.Status;
  if ([STATUS.REQUESTED, STATUS.ACCEPTED].includes(status) && moment(booking.StartTime) < moment()) {
    status = STATUS.EXPIRED;
  } else if (status === STATUS.CONFIRMED && moment(booking.StartTime) < moment()) {
    status = STATUS.COMPLETED;
  }
  return status;
};

export const getReviewAthlete = (booking: any) => find(booking.Reviews, r => r.Type === REVIEW_TYPE.ATHLETE);

export const getFullName = (item: any) => trim(`${item.FirstName} ${item.LastName}`);

export const floorReview = (reviews: any) => {
  const athleteReviews = filter(reviews, (r: any) => r.Type === REVIEW_TYPE.ATHLETE);
  const rating = !isEmpty(athleteReviews) ? floor(mean(map(athleteReviews, 'Rating')), 1) : null;
  const number = size(filter(athleteReviews, (r: any) => r.Type === REVIEW_TYPE.ATHLETE));
  return {rating, number};
};

export const formatTimeRequest = (date: any) => {
  const seconds = moment().diff(moment(date), 'seconds');
  const minutes = moment().diff(moment(date), 'minutes');
  const hours = moment().diff(moment(date), 'hours');
  const days = moment().diff(moment(date), 'days');
  if (days > 5) {
    return moment(date).format('DD/MM/YYYY');
  } else if (days > 0) {
    return `${days} days ago`;
  } else if (hours > 0) {
    return `${hours} hours ago`;
  } else if (minutes > 0) {
    return `${minutes} minutes ago`;
  } else {
    return `${seconds} seconds ago`;
  }
};

export const verifyPassword = (value: any, t: any) => {
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

  if (!hasUpperCase) {
    return t('InvaldPassword1');
  } else if (!hasLowerCase) {
    return t('InvaldPassword2');
  } else if (!hasNumber) {
    return t('InvaldPassword3');
  } else if (!hasSpecialChar) {
    return t('InvaldPassword4');
  }
  return true;
};

export const timesForCalendar = (availability: any, dateString: any) => {
  const dd = toUpper(moment(dateString).format('dd'));
  let times = cloneDeep(availability?.Available?.find((av: any) => av.name === dd))?.times || [];
  availability?.Exceptions?.forEach((ex: any) => {
    const exStartTime = moment(ex.startTime).format('YYYY-MM-DD HH:mm:ss');
    const exEndTime = moment(ex.endTime).format('YYYY-MM-DD HH:mm:ss');
    const exStartHour = moment(ex.startTime).hours() + moment(ex.startTime).minutes() / 60;
    const exEndHour = moment(ex.endTime).hours() + moment(ex.endTime).minutes() / 60;
    const newTimes: any = [];
    times?.forEach(({startTime, endTime}: any) => {
      const timeStart = moment(dateString).startOf('days').add(startTime, 'hours').format('YYYY-MM-DD HH:mm:ss');
      const timeEnd = moment(dateString).startOf('days').add(endTime, 'hours').format('YYYY-MM-DD HH:mm:ss');
      if (exStartTime > timeStart && exEndTime < timeEnd) {
        newTimes.push({startTime, endTime: exStartHour});
        newTimes.push({startTime: exEndHour, endTime});
      } else if (exStartTime > timeStart && exStartTime < timeEnd) {
        newTimes.push({startTime, endTime: exStartHour});
      } else if (exEndTime > timeStart && exEndTime < timeEnd) {
        newTimes.push({startTime: exEndHour, endTime});
      } else if (exEndTime < timeStart || timeEnd < exStartTime) {
        newTimes.push({startTime, endTime});
      }
    });
    times = newTimes;
  });
  return times;
};

export const getWarningAvailability = (availability: any, dateRange: any) => {
  const {Available, Exceptions} = availability || {};

  const dayOfWeek = toUpper(moment(dateRange.startDate).format('dd'));
  const timeRequest = toUpper(moment(dateRange.startDate).format('HH:mm:ss'));
  if (
    Exceptions &&
    Exceptions.find((exce: any) => moment(exce.startTime) <= moment(dateRange.startDate) && moment(exce.endTime) > moment(dateRange.startDate))
  ) {
    return true;
  }
  if (isEmpty(Available)) {
    return true;
  }
  const availableItem = cloneDeep(Available.find((avai: any) => avai.name === dayOfWeek));
  if (!availableItem) {
    return true;
  }
  const timeItem = availableItem.times.find(({startTime, endTime}: any) => {
    const star = moment(dateRange.startDate).startOf('day').add(startTime, 'hour').format('HH:mm:ss');
    const end = moment(dateRange.startDate).startOf('day').add(endTime, 'hour').format('HH:mm:ss');
    return star <= timeRequest && end > timeRequest;
  });
  if (!timeItem) {
    return true;
  }
  return false;
};

export const handleImageLibrary = async (t: any) => {
  const data: any = {noData: true};
  return await new Promise(resolve => {
    launchImageLibrary(data, async response => {
      if (response?.assets) {
        const size25mb = 1024 * 1024 * 25;
        const files = response?.assets;
        if (!files.find((file: any) => !file.fileSize || file.fileSize > size25mb)) {
          resolve(files);
        } else {
          Alert.alert(t('updoad25Mb'));
        }
      }
    });
  });
};

export const getImageSize = (uri: string) =>
  new Promise(resolve => {
    Image.getSize(uri, (width, height) => {
      resolve({width, height});
    });
  });
