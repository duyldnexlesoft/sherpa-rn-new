/* eslint-disable import/no-unresolved */
import axios from 'axios';
import { CURRENT_USER, httpMethods } from './constants';
import {BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAction } from 'app/store/actions';
import store from 'app/store/store';
import { omitBy } from 'lodash';
import Alert from 'app/components/Alert';

const execute = async (method: string, endpoint: string, body: object = {}, headers: any = {}) => {
  const userStorage = await AsyncStorage.getItem(CURRENT_USER);
  axios.defaults.baseURL = BASE_URL;
  // axios.defaults.baseURL = 'http://localhost:3001';
  // axios.defaults.baseURL = 'http://192.168.100.174:3001';
  const token = userStorage ? JSON.parse(userStorage).AccessToken : '';
  const requestConfig: any = {
    withCredentials: true,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: token,
      ...headers,
    },
    timeout: 20000,
  };
  if (method === httpMethods.GET) {
    requestConfig.params = omitBy(body, (value: any) => !value);
  }
  let callAxios;
  if (method === httpMethods.GET) {
    callAxios = axios.get(`${endpoint}`, requestConfig);
  } else if (method === httpMethods.POST) {
    callAxios = axios.post(endpoint, body, requestConfig);
  } else if (method === httpMethods.PUT) {
    callAxios = axios.put(endpoint, body, requestConfig);
  } else if (method === httpMethods.PATCH) {
    callAxios = axios.patch(endpoint, body, requestConfig);
  } else {
    callAxios = axios.delete(endpoint, requestConfig);
  }
  callAxios.then(handleToken).catch(handleCatch);
  return callAxios;
};

const handleCatch = (error: any) => {
  console.log(error);
  return error;
};

const handleToken = (response: any) => {
  if (response?.data?.code === 401) {
    store.dispatch(userAction.removeCurrentUser());
    Alert.alert('Your token has expired! Please login again.');
  }
  return response;
};

const get = async (endpoint: string, params?: any, headers?: any) =>
  execute(httpMethods.GET, endpoint, params, headers);

const post = async (endpoint: string, body?: any, headers?: any) =>
  execute(httpMethods.POST, endpoint, body, headers);

const put = async (endpoint: string, body?: any, headers?: any) =>
  execute(httpMethods.PUT, endpoint, body, headers);

const patch = async (endpoint: string, body: any, headers?: any) =>
  execute(httpMethods.PATCH, endpoint, body, headers);

const del = async (endpoint: string, body?: any, headers?: any) =>
  execute(httpMethods.DELETE, endpoint, body, headers);

export { get, post, put, patch, del };
